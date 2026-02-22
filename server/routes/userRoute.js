const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/users/me
 * Get the current user
 */
router.get("/users/me", authenticateToken, userController.getMe);

/**
 * GET /api/users/:userId
 * Get a user's public profile
 */
router.get("/users/:userId", authenticateToken, userController.getUser);

module.exports = router;

