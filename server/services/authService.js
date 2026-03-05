//Database connection
const connectDB = require("../db/connect");

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

    // Assign a default role (e.g. roleId = 1 = "user")
    // This is why the transaction is justified — user + role must both exist
    await connection.execute(
      `INSERT INTO UserRoles (userId, roleId) VALUES (?, ?)`,
      [userId, 1]
    );

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
  const db = await connectDB();

  const [rows] = await db.execute(
    `SELECT userId, userName, userPassword FROM Users WHERE userName = ?`,
    [userName]
  );

  // Return the single user or null — let the controller handle the 401
  return rows[0] ?? null;
};

module.exports = {registerUser, loginUser}