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
 * GET /api/rooms
 * Get all the rooms created by the logged in user (myRooms)
 */
router.get("/rooms/mine", authenticateToken, roomController.getMyRooms);

/**
 * GET /api/rooms
 * Gets all the rooms tge current user has been given permission to 
 */
router.get("/rooms/permitted", authenticateToken, roomController.getPermittedRooms);

/**
 * GET /api/rooms/:roomId
 * Get a specific room 
 */
router.get("/rooms/:roomId", authenticateToken, roomController.getRoom);

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
