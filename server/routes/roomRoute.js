const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/rooms
 * Get all the rooms available
 */
router.get("/rooms", authenticateToken, roomController.getRooms);

/**
 * POST /api/rooms
 * Create a new room (auth user creates it) 
 */
router.post("/rooms", authenticateToken, roomController.createRoom);

/**
 * GET /api/rooms/:roomId
 * Get a specific room 
 */
router.get("/:roomId", authenticateToken, roomController.getRoom);

/**
 * PUT /api/rooms/:roomId
 * Update room (if creator or has canEditRoom permission)
 */
router.put("/rooms/:roomId", authenticateToken, roomController.updateRoom);

/**
 * DELETE /api/rooms/:roomId
 * Delete room (if creator)
 */
router.delete("/rooms/:roomId", authenticateToken, roomController.deleteRoom);

module.exports = router;
