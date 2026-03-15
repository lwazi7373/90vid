//Database connection
const connectDB = require("../db/Connect");
const { notFound } = require("../errors/httpErrors");

/**
 * Service to register a user to the database
 * @param {String} userName
 * @param {String} userPassword
 * @param {String} emailAddress
 * @param {Number} contactNo
 * @param {Boolean} isActive
 * @returns The id of the user that has just been created/Registered
 */
const registerUser = async (userName, userPassword, emailAddress, contactNo, isActive) => {
  let connection;
  try {
    connection = await connectDB.getConnection();
    await connection.beginTransaction();

    // Insert the user
    const [userResult] = await connection.execute(
      `INSERT INTO Users (userName, userPassword, emailAddress, contactNo, isActive)
       VALUES (?, ?, ?, ?, ?)`,
      [userName, userPassword, emailAddress, contactNo, isActive]
    );

    const userId = userResult.insertId;
    /*
    // Assign a default role (e.g. roleId = 1 = "user")
    // This is why the transaction is justified — user + role must both exist
    await connection.execute(
      `INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)`,
      [userId, 1]
    );
    */
    await connection.commit();
    return userId;

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to register user:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};


/**
 * Service to login user 
 * @param {String} userName
 * @returns {Promise<Object>} user object
 */
const loginUser = async (userName) => {
  const db = connectDB;

  const [rows] = await db.execute(
    `SELECT userId, userName, userPassword FROM Users WHERE userName = ?`,
    [userName]
  );

  // Return the single user or null — let the controller handle the 401
  return rows[0] ?? null;
};

/**
 * Get current user (Logged In) with ALL their profile data
 * @param {number} userId - The user's ID from JWT token
 * @returns {Promise<Object>} Complete user profile
 */
const getCurrentUser = async (userId) => {
  const db = connectDB;

  // Core user info + roles
  const [userRows] = await db.query(
    `SELECT 
      u.userId,
      u.userName,
      u.emailAddress,
      u.contactNo,
      u.isActive,
      u.createdAt,
      u.updatedAt,
      GROUP_CONCAT(DISTINCT r.roleName ORDER BY r.roleName SEPARATOR ',') AS roles
    FROM Users u
    LEFT JOIN UserRoles ur ON u.userId = ur.userId
    LEFT JOIN Roles r ON ur.roleId = r.roleId
    WHERE u.userId = ?
    GROUP BY u.userId`,
    [userId]
  );

  if (!userRows.length) throw notFound("User not found");

  const user = userRows[0];

  // Rooms the user created
  const [createdRooms] = await db.query(
    `SELECT roomId, roomName, description, createdAt
     FROM Rooms
     WHERE createdBy = ?
     ORDER BY createdAt DESC`,
    [userId]
  );

  // Rooms the user has been granted permissions to (excluding ones they created)
  const [permittedRooms] = await db.query(
    `SELECT 
      rp.permissionId,
      rp.roomId,
      ro.roomName,
      rp.canUpload,
      rp.canDelete,
      rp.canEditRoom,
      rp.grantedAt
    FROM RoomPermissions rp
    JOIN Rooms ro ON rp.roomId = ro.roomId
    WHERE rp.userId = ?
    ORDER BY rp.grantedAt DESC`,
    [userId]
  );

  // Upload stats
  const [[imageStats]] = await db.query(
    `SELECT COUNT(*) AS totalImages
     FROM Images
     WHERE uploadedBy = ?`,
    [userId]
  );

  const [[videoStats]] = await db.query(
    `SELECT 
      COUNT(*) AS totalVideos,
      COALESCE(SUM(durationSeconds), 0) AS totalDurationSeconds
     FROM Videos
     WHERE uploadedBy = ?`,
    [userId]
  );

  return {
    userId: user.userId,
    userName: user.userName,
    emailAddress: user.emailAddress,
    contactNo: user.contactNo,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles ? user.roles.split(",") : [],
    rooms: {
      created: createdRooms,
      permitted: permittedRooms,
    },
    uploadStats: {
      totalImages: imageStats.totalImages,
      totalVideos: videoStats.totalVideos,
      totalDurationSeconds: videoStats.totalDurationSeconds,
    },
  };
};

module.exports = {registerUser, loginUser, getCurrentUser}