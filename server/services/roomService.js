const connectDB = require("../db/Connect");
const { badRequest, forbidden, notFound } = require("../errors/httpErrors");
const { uploadToS3, deleteFromS3 } =  require("../utils/s3Helpers");

const { getCache, setCache, deleteCache } = require("../cache/cacheService");
const keys = require("../cache/cacheKeys");

////////////////////////////////////////////////////////// Utility methods /////////////////////////////////////////////////////////////////////
/**
 * Get the room or throw not found error
 * @param {connectDB} db 
 * @param {number} roomId 
 * @returns room
 */
const getRoomOrThrow = async (db, roomId) => {
  const [[room]] = await db.execute(
    `SELECT roomId, roomName, thumbnailUrl, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);
  return room;
};

/**
 * Checks to see if a user can upload and delete in/from this room 
 * @param {connectDB} db 
 * @param {Number} roomId 
 * @param {Number} userId 
 * @returns boolean 
 */
const getRoomPermission = async (db, roomId, userId) => {
  const [[permission]] = await db.execute(
    `SELECT canUpload, canDelete FROM RoomPermissions 
     WHERE roomId = ? AND userId = ?`,
    [roomId, userId]
  );
  return permission ?? null;
};

/**
 * Assess the permission the user has
 * @param {room} room 
 * @param {boolean or null} permission 
 * @param {Number} userId 
 * @param {String} permissionKey 
 * @returns boolean
 */
const hasAccess = (room, permission, userId, permissionKey) => {
  if (room.createdBy === userId) return true;
  if (permission && permission[permissionKey]) return true;
  return false;
};

///////////////////////////////////////////////////////////////////// Rooms //////////////////////////////////////////////////////////////////////
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
      r.thumbnailUrl,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName,
      (SELECT COUNT(*) FROM Images WHERE roomId = r.roomId) AS imageCount,
      (SELECT COUNT(*) FROM Videos WHERE roomId = r.roomId) AS videoCount
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
      r.thumbnailUrl,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName,
      (SELECT COUNT(*) FROM Images WHERE roomId = r.roomId) AS imageCount,
      (SELECT COUNT(*) FROM Videos WHERE roomId = r.roomId) AS videoCount      
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
      r.thumbnailUrl,
      r.createdAt,
      (SELECT COUNT(*) FROM Images WHERE roomId = r.roomId) AS imageCount,
      (SELECT COUNT(*) FROM Videos WHERE roomId = r.roomId) AS videoCount
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
      r.thumbnailUrl,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName,
      rp.canUpload,
      rp.canDelete,
      rp.canEditRoom,
      (SELECT COUNT(*) FROM Images WHERE roomId = r.roomId) AS imageCount,
      (SELECT COUNT(*) FROM Videos WHERE roomId = r.roomId) AS videoCount      
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
 * @returns room data
 */
const createRoom = async (userId, roomName, description, file) => {
  const db = connectDB;

  if (!roomName) throw badRequest("roomName is required");

  // Upload room thumbnail to S3
  const thumbnailUrl = await uploadToS3(file.buffer, file.mimetype, "rooms/thumbnails");

  const [result] = await db.execute(
    `INSERT INTO Rooms (roomName, description, createdBy, thumbnailUrl) VALUES (?, ?, ?, ?)`,
    [roomName, description ?? null, userId, thumbnailUrl]
  );

  // Invalidate caches
  try {
    await deleteCache(keys.rooms.user(userId));
    await deleteCache(keys.rooms.all());
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (createRoom):", err);
  }

  return { roomId: result.insertId, roomName, description, createdBy: userId, thumbnailUrl };
};

/**
 * Updates the details of the room 
 * @param {Number} roomId 
 * @param {Number} userId 
 * @param {String, String} param2 
 * @returns updatedRoom
 */
const updateRoom = async (roomId, userId, { roomName, description, file }) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);

  // Check if user has permission to edit the room
  const permission = await getRoomPermission(db, roomId, userId);
  if (!hasAccess(room, permission, userId, "canEditRoom")) {
    throw forbidden("You do not have permission to edit this room");
  }

  // Only upload a new thumbnail if a file was actually sent
  let thumbnailUrl = room.thumbnailUrl;
  if (file) {
    // Delete the old thumbnail from S3 before uploading the new one
    if (room.thumbnailUrl) await deleteFromS3(room.thumbnailUrl);
    thumbnailUrl = await uploadToS3(file.buffer, file.mimetype, "rooms/thumbnails");
  }

  const [result] = await db.execute(
    `UPDATE Rooms SET 
      roomName = COALESCE(?, roomName),
      description = COALESCE(?, description),
      thumbnailUrl = ?
     WHERE roomId = ?`,
    [roomName ?? null, description ?? null, thumbnailUrl, roomId]
  );

  // Invalidate caches
  try {
    await deleteCache(keys.rooms.user(userId));
    await deleteCache(keys.rooms.all());
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (updateRoom):", err);
  }

  return { roomId, roomName, description, thumbnailUrl, updatedBy: userId };
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