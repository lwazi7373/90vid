const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const authenticateToken = require("../middleware/authMiddleware");

const { imageUpload, handleUploadError } = require("../middleware/uploadMiddleware");

/**
 * GET /api/rooms
 * Get all the rooms available
 */
router.get("/rooms", authenticateToken, roomController.getRooms);

/**
 * POST /api/rooms
 * Create a new room (auth user creates it) 
 * A room has a thumbnail (Room-Card on the frontend) hence the image upload when creating it
 */
router.post("/rooms", authenticateToken, imageUpload.single("image"), handleUploadError, roomController.createRoom);

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
 * PATCH /api/rooms/:roomId
 * Update a room (creator or user with canEditRoom permission)
 * Image is optional here — user may only be updating roomName or description
 */
router.patch("/rooms/:roomId", authenticateToken, imageUpload.single("image"), handleUploadError, roomController.updateRoom);

/**
 * DELETE /api/rooms/:roomId
 * Delete room (if creator)
 */
router.delete("/rooms/:roomId", authenticateToken, roomController.deleteRoom);

module.exports = router;
