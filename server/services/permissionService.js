const connectDB = require("../db/Connect");
const { badRequest, forbidden, notFound } = require("../errors/httpErrors");

/**
 * Get all users who have been granted permissions in a room.
 * Only the room creator can see this.
 */
const permittedUsers = async (roomId, userId) => {
  const db = await connectDB();

  const [[room]] = await db.execute(
    `SELECT roomId, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);
  if (room.createdBy !== userId) throw forbidden("Only the room creator can view permissions");

  const [users] = await db.execute(
    `SELECT
      rp.permissionId,
      rp.canUpload,
      rp.canDelete,
      rp.canEditRoom,
      rp.grantedAt,
      u.userId,
      u.userName
     FROM RoomPermissions rp
     JOIN Users u ON u.userId = rp.userId
     WHERE rp.roomId = ?
     ORDER BY rp.grantedAt DESC`,
    [roomId]
  );

  return users;
};

/**
 * Grant permissions to a user in a room.
 * Only the room creator can do this.
 * If the user already has a permission row, update it instead of inserting.
 */
const permitUser = async (roomId, creatorId, { userId, canUpload, canDelete, canEditRoom }) => {
  const db = await connectDB();

  if (!userId) throw badRequest("userId is required");

  // Confirm the room exists and the requester is the creator
  const [[room]] = await db.execute(
    `SELECT roomId, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);
  if (room.createdBy !== creatorId) throw forbidden("Only the room creator can grant permissions");

  // Creator should not be granting permissions to themselves
  if (userId === creatorId) throw badRequest("You are the room creator, you already have full access");

  // Confirm the target user exists
  const [[targetUser]] = await db.execute(
    `SELECT userId FROM Users WHERE userId = ? AND isActive = TRUE`,
    [userId]
  );
  if (!targetUser) throw notFound(`User ${userId} not found`);

  // Check if a permission row already exists for this user in this room
  const [[existing]] = await db.execute(
    `SELECT permissionId FROM RoomPermissions WHERE roomId = ? AND userId = ?`,
    [roomId, userId]
  );

  if (existing) {
    // Already has a row — update it instead
    await db.execute(
      `UPDATE RoomPermissions
       SET
         canUpload   = COALESCE(?, canUpload),
         canDelete   = COALESCE(?, canDelete),
         canEditRoom = COALESCE(?, canEditRoom)
       WHERE roomId = ? AND userId = ?`,
      [
        canUpload   ?? null,
        canDelete   ?? null,
        canEditRoom ?? null,
        roomId,
        userId
      ]
    );

    const [[updated]] = await db.execute(
      `SELECT permissionId, roomId, userId, canUpload, canDelete, canEditRoom, grantedAt
       FROM RoomPermissions WHERE roomId = ? AND userId = ?`,
      [roomId, userId]
    );

    return updated;
  }

  // No existing row — insert fresh
  const [result] = await db.execute(
    `INSERT INTO RoomPermissions (roomId, userId, canUpload, canDelete, canEditRoom, grantedBy)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      roomId,
      userId,
      canUpload   ?? false,
      canDelete   ?? false,
      canEditRoom ?? false,
      creatorId
    ]
  );

  return {
    permissionId: result.insertId,
    roomId,
    userId,
    canUpload:   canUpload   ?? false,
    canDelete:   canDelete   ?? false,
    canEditRoom: canEditRoom ?? false,
    grantedBy: creatorId
  };
};

/**
 * Revoke all permissions from a user in a room.
 * Only the room creator can do this.
 */
const revokeUser = async (roomId, creatorId, targetUserId) => {
  const db = await connectDB();

  const [[room]] = await db.execute(
    `SELECT roomId, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);
  if (room.createdBy !== creatorId) throw forbidden("Only the room creator can revoke permissions");

  const [[permission]] = await db.execute(
    `SELECT permissionId FROM RoomPermissions WHERE roomId = ? AND userId = ?`,
    [roomId, targetUserId]
  );
  if (!permission) throw notFound(`User ${targetUserId} has no permissions in this room`);

  await db.execute(
    `DELETE FROM RoomPermissions WHERE roomId = ? AND userId = ?`,
    [roomId, targetUserId]
  );
};

module.exports = { permittedUsers, permitUser, revokeUser };