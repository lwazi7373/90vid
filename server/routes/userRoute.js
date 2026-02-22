const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/users/me
 * Get the current user
 */
router.get("/users/me", authenticateToken, userController.getMe);

module.exports = router;

