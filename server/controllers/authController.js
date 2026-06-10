const jwt = require("jsonwebtoken"); // create tokens
const bcrypt = require("bcrypt"); // encrypt passwords
const { badRequest, notFound } = require("../errors/httpErrors");
const authService = require("../services/authService");

/**
 * Controller to register the user to the system
 * @param {*} req
 * @param {*} res
 * @returns successsful message and the new user's Id
 */
const register = async (req, res) => {
  const { userName, userPassword, emailAddress, contactNo, isActive } = req.body;

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(userPassword, salt);
  
  // Register the user
  const newUserId = await authService.registerUser(
    userName,
    hashedPassword,
    emailAddress,
    contactNo,
    isActive,
  );

  // Send response
  res.status(200).json({msg: `Sucessfully registered user: ${newUserId}`});
};


/**
 * Verifies user credentials, if successful creates an authToken for the user and logs them in
 * authToken expires after 1 day, that is 24 hours
 * @param {String} req
 * @param {String} res
 * @returns 
 */
const login = async (req, res) => {
  const { userName, userPassword } = req.body;
  const user = await authService.loginUser(userName, userPassword); 

  // Check for all required credentials
  if (!userName || !userPassword) throw badRequest("Missing credentials");

  // Create token
  const payload = { userId: user.userId, userName: user.userName};
  const secret = process.env.JWT_SECRET;
  const authToken = jwt.sign(payload, secret, { expiresIn: "1d" });

  // Send response
  res.status(200).json({msg: "Sucessfully logged In User", authToken, user});
};

/**
 * Gets the current user (for frontend architecture purposes)
 * @param {*} req
 * @param {*} res
 * @returns user's data
 */
const getMe = async (req, res) => {
  const userId = req.user.userId; // From the JWT token (its named user)
  const userData = await authService.getCurrentUser(userId);
  if (!userData) throw notFound("User not found");
  res.status(200).json({ msg: "User found", user: userData });
};

module.exports = {register, login, getMe};