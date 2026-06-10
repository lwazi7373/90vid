const connectDB = require("../db/Connect"); // Database connection
const bcrypt = require("bcrypt"); // decrypt passwords
const {forbidden, notFound } = require("../errors/httpErrors");
const {getCache, setCache, deleteCache, increment, setExpiry} = require("../cache/cacheService");
const keys = require("../cache/cacheKeys");

const MAX_ATTEMPTS = 5; // Maximum number of times user can try to login
const WINDOW_SECONDS = 900; // 15 minutes

/**
 * Service to register the user 
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
 * Helper for failed attempts
 * @param {*} attemptKey 
 */
const handleFailedAttempt = async (attemptKey) => {
  try {
    const attempts = await increment(attemptKey);

    // Set expiry only on first failure
    if (attempts === 1) {
      await setExpiry(attemptKey, WINDOW_SECONDS);
    }

    console.log(`Failed login attempt (${attempts})`);
  } catch (err) {
    console.error("Cache error (failed attempt):", err);
  }
};

/**
 * Service to login user 
 * Authenticates a user with rate limiting, via redis
 * @param {String} userName
 * @param {String} userPassword
 * @returns {Promise<Object>} user object
 */
const loginUser = async (userName, userPassword) => {
  const db = connectDB;

  const attemptKey = keys.login.attempts(userName);

  // Check current failed attempts
  let attempts = 0;

  try {
    // Get the number of attempts from cache
    const cachedAttempts = await getCache(attemptKey);
    // Assign theem to attempts variable
    attempts = cachedAttempts ? Number(cachedAttempts) : 0;
  } catch (err) {
    console.error("Cache error (login attempts):", err);
  }

  // If attempts is greater equal to 5 then block user from trying again
  if (attempts >= MAX_ATTEMPTS) {
    throw forbidden("Too many login attempts. Try again later.");
  }

  const [rows] = await db.execute(
    `SELECT userId, userName, userPassword, isActive FROM Users WHERE userName = ?`,
    [userName]
  );

  const user = rows[0];

  if (!user) {
    // Still count attempt (important for security)
    await handleFailedAttempt(attemptKey);
    throw notFound("Invalid credentials");
  }

  if (!user.isActive) {
    throw forbidden("Account is inactive");
  }

  // Compare password
  const isMatch = await bcrypt.compare(userPassword, user.userPassword);

  if (!isMatch) {
    // Still count attempt (important for security)
    await handleFailedAttempt(attemptKey);
    throw notFound("Invalid credentials");
  }

  // When successful then reset attempts by removing the attemptKey cache (attempt count)
  try {
    await deleteCache(attemptKey);
  } catch (err) {
    console.error("Cache delete error (login success):", err);
  }

  // Return user
  return {
    userId: user.userId,
    userName: user.userName,
  };

};

/**
 * Get current user (Logged In) with ALL their profile data
 * @param {number} userId - The user's ID from JWT token
 * @returns {Promise<Object>} Complete user profile
 */
const getCurrentUser = async (userId) => {
  const db = connectDB;

   const cacheKey = keys.user.profile(userId);

  // Try to get user from cache first
  try {
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) {
      console.log("Cache HIT: getCurrentUser");
      return cachedUser;
    }
  } catch (err) {
    console.error("Cache error (getCurrentUser):", err);
  }

  console.log("Cache MISS: getCurrentUser");

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

  const fullUser = {
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

  // Cache the user's profile information 
  try {
    await setCache(cacheKey, fullUser, 120); // shorter TTL (2 min)
  } catch (err) {
    console.error("Cache set error (getCurrentUser):", err);
  }

  return fullUser;
};

module.exports = {registerUser, loginUser, getCurrentUser}