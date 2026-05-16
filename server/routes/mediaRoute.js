const express = require("express");
const router = express.Router();

const mediaController = require("../controllers/mediaController");
const authenticateToken = require("../middleware/authMiddleware");
const { imageUpload, handleUploadError } = require("../middleware/uploadMiddleware");

/**
 * GET /api/rooms/:roomId/images
 * Get all images in the room
 */
router.get("/rooms/:roomId/images", authenticateToken, mediaController.getImages);

/**
 * GET /api/rooms/:roomId/images/:imageId
 * Get a single image (when in focus)
 */
router.get("/rooms/:roomId/images/:imageId", authenticateToken, mediaController.getImage);

/**
 * GET /api/rooms/:roomId/videos
 * Get all videos in the room
 */
router.get("/rooms/:roomId/videos", authenticateToken, mediaController.getVideos);

/**
 * GET /api/rooms/:roomId/videos/:videoId
 * Get a single video (when in focus)
 */
router.get("/rooms/:roomId/videos/:videoId", authenticateToken, mediaController.getVideo);

/**
 * POST /api/rooms/:roomId/images
 * Upload an image to a room -> (if creator or has canUpload permission)
 * imageUpload.single("image") tells multer to expect one file under the field name "image"
 * Meaning The string "image" is the field name multer looks for in the incoming multipart form data.
 * So the client must send the file under a field named "image"
 */
router.post("/rooms/:roomId/images", authenticateToken, imageUpload.single("image"), handleUploadError, mediaController.postImage);

/**
 * POST /api/rooms/:roomId/videos/presigned-url
 * Step 1 of video upload — checks permissions and returns a presigned S3 URL
 * Client uses that URL to upload the video file directly to S3
 */
router.post("/rooms/:roomId/videos/presigned-url", authenticateToken, mediaController.getVideoUploadUrl);

/**
 * POST /api/rooms/:roomId/videos/thumbnail-url
 * Part of the video upload flow — Step 1.5 (runs after the client has uploaded the video to S3)
 * 
 * Since videos go directly from the client to S3 (never through our server),
 * we can't generate the thumbnail server-side like we do for images.
 * Instead, the client extracts a frame from the video using the Canvas API,
 * then calls this endpoint to get a presigned URL to upload that frame directly to S3.
 * 
 * The returned thumbnailUrl is then included in the confirm request (Step 2)
 * so it gets saved to the DB alongside the video metadata.
 */
router.post("/rooms/:roomId/videos/thumbnail-url", authenticateToken, mediaController.getVideoThumbnailUrl);

/**
 * POST /api/rooms/:roomId/videos/confirm
 * Step 2 of video upload — client calls this after successfully uploading to S3
 * Saves the video metadata (title, fileUrl, etc.) to the DB
 */
router.post("/rooms/:roomId/videos/confirm", authenticateToken, mediaController.postVideo);

/**
 * DELETE /api/rooms/:roomId/images/:imageId
 * Delete an image from the room -> (if creator or has canDelete permission)
 */
router.delete("/rooms/:roomId/images/:imageId", authenticateToken, mediaController.removeImage);

/**
 * DELETE /api/rooms/:roomId/videos/:videoId
 * Delete a video from the room -> (if creator or has canDelete permission)
 */
router.delete("/rooms/:roomId/videos/:videoId", authenticateToken, mediaController.removeVideo);

module.exports = router;