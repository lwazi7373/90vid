const express = require("express");
const router = express.Router();

const mediaController = require("../controllers/mediaController");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/rooms/:roomId/images
 * Get the images in the room
 */
router.get("/rooms/:roomId/images", authenticateToken, mediaController.getImages);

/**
 * GET /api/rooms/:roomId/images/:imageId
 * Get the image (when in focus)
 */
router.get("/rooms/:roomId/images/:imageId", authenticateToken, mediaController.getImage);

/**
 * GET /api/rooms/:roomId/videos
 * Get the videos in the room
 */
router.get("/rooms/:roomId/videos", authenticateToken, mediaController.getVideos);

/**
 * GET /api/rooms/:roomId/videos/:videoId
 * Get the video (when in focus)
 */
router.get("/rooms/:roomId/videos", authenticateToken, mediaController.getVideo);

/**
 * POST /api/rooms/:roomId/images
 * Upload images to a room (basically post images) -> (if creator or has canUpload permission)
 */
router.post("/rooms/:roomId/images", authenticateToken, mediaController.postImages);

/**
 * POST /api/rooms/:roomId/videos
 * Upload videos to a room (basically post videos) -> (if creator or has canUpload permission)
 */
router.post("/rooms/:roomId/videos", authenticateToken, mediaController.postVideos);

/**
 * DELETE /api/rooms/:roomId/images/:imageId
 * Delete an image from the room (basically takedown an image) -> (if creator or has canDelete permission)
 */
router.delete("/rooms/:roomId/images/:imageId", authenticateToken, mediaController.removeImage);

/**
 * DELETE /api/rooms/:roomId/videos/:videoId
 * Delete a video from the room (basically takedown a video) -> (if creator or has canDelete permission)
 */
router.delete("/rooms/:roomId/videos/:videoId", authenticateToken, mediaController.removeVideo);

module.exports = router;
