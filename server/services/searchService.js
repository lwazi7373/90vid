const connectDB = require("../db/Connect");
const { notFound } = require("../errors/httpErrors");

/**
 * @param {String} roomName
 * Search for rooms by partial name match.
 * Returns all matching rooms (name is NOT unique) with enough detail
 * for the frontend to distinguish between rooms with the same name.
 */
const searchRooms = async (roomName) => {
  const db = connectDB;

  const [rows] = await db.execute(
    `SELECT 
      r.roomId,
      r.roomName,
      r.description,
      r.createdAt,
      u.userId   AS creatorId,
      u.userName AS creatorName
    FROM Rooms r
    JOIN Users u ON u.userId = r.createdBy
    WHERE r.roomName LIKE ?
    ORDER BY r.roomName ASC
    LIMIT 20`,
    [`%${roomName}%`]
  );

  if (rows.length === 0) {
    throw notFound(`No rooms found matching "${roomName}"`);
  }

  return rows;
};

/**
 * @param {String} userName
 * Search for an active user by partial username match.
 * userName IS unique, but partial matching (LIKE) still lets
 * users find "john" by typing "jo".
 */
const searchUsers = async (userName) => {
  const db = connectDB;

  const [rows] = await db.execute(
    `SELECT 
      userId,
      userName,
      emailAddress,
      createdAt
    FROM Users
    WHERE userName LIKE ?
      AND isActive = TRUE
    ORDER BY userName ASC
    LIMIT 20`,
    [`%${userName}%`]
  );

  if (rows.length === 0) {
    throw notFound(`No active users found matching "${userName}"`);
  }

  return rows;
};

module.exports = { searchRooms, searchUsers };