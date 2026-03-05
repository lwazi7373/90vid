const { notFound } = require("../errors/httpErrors");
const userService = require("../services/userService");
/**
 * Gets the current user (for frontend architecture purposes)
 * @param {*} req
 * @param {*} res
 * @returns user's data
 */
const getMe = async (req, res) => {
  const userId = req.user.userId; // From the JWT token (its named user)
  const userData = await userService.getCurrentUser(userId);
  if (!userData) throw notFound("User not found");
  res.status(200).json({ msg: "User found", user: userData });
};

module.exports = {getMe};