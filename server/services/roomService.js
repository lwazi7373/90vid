const connectDB = require("../db/Connect");
const { badRequest, forbidden, notFound } = require("../errors/httpErrors");

/**
 * Gets all the rooms available on the platform
 * @returns rooms
 */
const getRooms = async () => {
  const db = connectDB;

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

  return rooms;
};

/**
 * Gets a particular room 
 * @param {Number} roomId 
 * @returns 
 */
const getRoom = async (roomId) => {
  const db = connectDB;

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
  return room;
};

/**
 * Creates a room for a user
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

  await db.execute(`DELETE FROM Rooms WHERE roomId = ?`, [roomId]);
};

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom };