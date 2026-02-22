const express = require("express");
const router = express.Router();

const permissionController = require("../controllers/permissionController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/rooms/:roomId/permissions
 * Get the user(s) with the room's permission
 */
router.get("/rooms/:roomId/permissions", authenticateToken, permissionController.permittedUsers);

/**
 * POST /api/rooms/:roomId/permissions
 * Grant room permission to a user (if creator)
 */
router.post("/rooms/:roomId/permissions", authenticateToken, permissionController.permitUser);

/**
 * DELETE /api/rooms/:roomId/permissions/:userId
 * Revoke room permission from a user (if creator)
 */
router.delete("/rooms/:roomId/permissions/:userId", authenticateToken, permissionController.revokeUser);

module.exports = router;
