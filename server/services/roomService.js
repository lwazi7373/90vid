const connectDB = require("../db/Connect");
const { badRequest, forbidden, notFound } = require("../errors/httpErrors");

const { getCache, setCache, deleteCache } = require("../cache/cacheService");
const keys = require("../cache/cacheKeys");

/**
 * Gets all the rooms available on the platform
 * Uses cache-aside pattern
 * @returns rooms
 */
const getRooms = async () => {
  const db = connectDB;
  // Get the Cache key for all rooms
  const cacheKey = keys.rooms.all();

  // Try to get from cache first (non-blocking)
  try {
    const cachedRooms = await getCache(cacheKey);
    if (cachedRooms) {
      console.log("Cache HIT: getRooms");
      return cachedRooms;
    }
  } catch (err) {
    console.error("Cache error (getRooms):", err);
  }

  console.log("Cache MISS: getRooms");

  // Fetch from DB
  const [rooms] = await db.execute(
    `SELECT 
      r.roomId,
      r.roomName,
      r.description,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName
     FROM Rooms r
     JOIN Users u ON u.userId = r.createdBy
     ORDER BY r.createdAt DESC`
  );

  // Store the rooms in cache after fetching from DB (non-blocking)
  try {
    await setCache(cacheKey, rooms);
  } catch (err) {
    console.error("Cache set error (getRooms):", err);
  }

  return rooms;
}

/**
 * Gets a particular room 
 * @param {Number} roomId 
 * @returns 
 */
const getRoom = async (roomId) => {
  const db = connectDB;

  // Get the Cache key for the room
  const cacheKey = keys.room(roomId);

  // Try to get from cache first
  try {
    const cachedRoom = await getCache(cacheKey);
    if (cachedRoom) {
      console.log("Cache HIT: getRoom");
      return cachedRoom;
    }
  } catch (err) {
    console.error("Cache error (getRoom):", err);
  }

  console.log("Cache MISS: getRoom");

  const [[room]] = await db.execute(
    `SELECT 
      r.roomId,
      r.roomName,
      r.description,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName
     FROM Rooms r
     JOIN Users u ON u.userId = r.createdBy
     WHERE r.roomId = ?`,
    [roomId]
  );

  if (!room) throw notFound(`Room ${roomId} not found`);

  // Store the room in cache
  try {
    await setCache(cacheKey, room);
  } catch (err) {
    console.error("Cache set error (getRoom):", err);
  }

  //return the room
  return room;
};

/**
 * Gets the current users rooms (created by the user)
 * @param {Number} userId 
 * @returns the rooms or an empty array
 */
const getMyRooms = async (userId) => {
  const db = connectDB;

   // Get the Cache key for the user's rooms
  const cacheKey = keys.rooms.user(userId);

  // Try get the rooms from the cache first
  try {
    const cachedRooms = await getCache(cacheKey);
    if (cachedRooms) {
      console.log("Cache HIT: getMyRooms");
      return cachedRooms;
    }
  } catch (err) {
    console.error("Cache error (getMyRooms):", err);
  }

  //If not found then, fetch the rooms from DB and cache them, then return them
  console.log("Cache MISS: getMyRooms");

  const [rooms] = await db.execute(
    `SELECT
      r.roomId,
      r.roomName,
      r.description,
      r.createdAt
     FROM Rooms r
     WHERE r.createdBy = ?
     ORDER BY r.createdAt DESC`,
    [userId]
  );

  // Store the user's rooms in cache
  try {
    await setCache(cacheKey, rooms);
  } catch (err) {
    console.error("Cache set error (getMyRooms):", err);
  }

  return rooms;
};

/**
 * Gets the rooms the current user has been given permission to
 * @param {Number} userId 
 * @returns the rooms on an empty array
 */
const getPermittedRooms = async (userId) => {
  const db = connectDB;

  const [rooms] = await db.execute(
    `SELECT
      r.roomId,
      r.roomName,
      r.description,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName,
      rp.canUpload,
      rp.canDelete,
      rp.canEditRoom
     FROM RoomPermissions rp
     JOIN Rooms r  ON r.roomId  = rp.roomId
     JOIN Users u  ON u.userId  = r.createdBy
     WHERE rp.userId = ?
     ORDER BY r.createdAt DESC`,
    [userId]
  );

  return rooms;
};

/**
 * Creates a room for a user
 * Invalidates affected caches
 * @param {Number} userId 
 * @param {String, String} param1 
 * @returns 
 */
const createRoom = async (userId, { roomName, description }) => {
  const db = connectDB;

  if (!roomName) throw badRequest("roomName is required");

  const [result] = await db.execute(
    `INSERT INTO Rooms (roomName, description, createdBy) VALUES (?, ?, ?)`,
    [roomName, description ?? null, userId]
  );

  // Invalidate caches
  try {
    await deleteCache(keys.rooms.user(userId));
    await deleteCache(keys.rooms.all());
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (createRoom):", err);
  }

  return { roomId: result.insertId, roomName, description, createdBy: userId };
};

/**
 * Updates the details of the room 
 * @param {Number} roomId 
 * @param {Number} userId 
 * @param {String, String} param2 
 * @returns 
 */
const updateRoom = async (roomId, userId, { roomName, description }) => {
  const db = connectDB;

  // Check room exists
  const [[room]] = await db.execute(
    `SELECT roomId, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);

  // Check permission — creator OR has canEditRoom
  const isCreator = room.createdBy === userId;
  if (!isCreator) {
    const [[permission]] = await db.execute(
      `SELECT canEditRoom FROM RoomPermissions WHERE roomId = ? AND userId = ?`,
      [roomId, userId]
    );
    if (!permission || !permission.canEditRoom) {
      throw forbidden("You do not have permission to edit this room");
    }
  }

  // Only update fields that were actually sent
  if (!roomName && !description) throw badRequest("Nothing to update");

  // COALESCE(?, roomName) means "use the ? value if it's not null, otherwise keep the existing roomName
  // This lets us send just { roomName: "New Name" } without touching the description, 
  // or just { description: "New desc" } without touching the name
  await db.execute(
    `UPDATE Rooms 
     SET 
       roomName    = COALESCE(?, roomName),
       description = COALESCE(?, description)
     WHERE roomId  = ?`,
    [roomName ?? null, description ?? null, roomId]
  );

  // Invalidate caches
  try {
      await deleteCache(keys.room(roomId));
      await deleteCache(keys.rooms.user(room.createdBy));
      await deleteCache(keys.rooms.all());
      await deleteCache(keys.user.profile(userId));
  } catch (err) {
      console.error("Cache delete error (updateRoom):", err);
  }

  // Return the updated room
  const [[updatedRoom]] = await db.execute(
    `SELECT roomId, roomName, description, createdBy, createdAt 
     FROM Rooms WHERE roomId = ?`,
    [roomId]
  );

  return updatedRoom;
};

/**
 * Removes a room from the platform
 * @param {Number} roomId 
 * @param {Number} userId 
 */
const deleteRoom = async (roomId, userId) => {
  const db = connectDB;

  const [[room]] = await db.execute(
    `SELECT roomId, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);

  // Only the creator can delete — no permission can grant this
  if (room.createdBy !== userId) {
    throw forbidden("Only the room creator can delete this room");
  }

  // Invalidate caches
  try {
    await deleteCache(keys.room(roomId));
    await deleteCache(keys.rooms.user(userId));
    await deleteCache(keys.rooms.all());
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (deleteRoom):", err);
  }

  await db.execute(`DELETE FROM Rooms WHERE roomId = ?`, [roomId]);
};

module.exports = { getRooms, getRoom, getMyRooms, getPermittedRooms ,createRoom, updateRoom, deleteRoom };