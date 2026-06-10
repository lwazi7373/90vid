const mediaService = require("../services/mediaService");
const { badRequest } = require("../errors/httpErrors");

/**
 * Controller to get images in a room 
 * @returns images and count
 */
const getImages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const images = await mediaService.getImages(roomId);
    return res.status(200).json({ results: images, count: images.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get a particular image
 * @returns image
 */
const getImage = async (req, res, next) => {
  try {
    const { roomId, imageId } = req.params;
    const image = await mediaService.getImage(roomId, imageId);
    return res.status(200).json(image);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get videos in a room 
 * @returns videos and count
 */
const getVideos = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const videos = await mediaService.getVideos(roomId);
    return res.status(200).json({ results: videos, count: videos.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get a particular video
 * @returns video
 */
const getVideo = async (req, res, next) => {
  try {
    const { roomId, videoId } = req.params;
    const video = await mediaService.getVideo(roomId, videoId);
    return res.status(200).json(video);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to upload an image to a room
 * @returns uploaded image
 */
const postImage = async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user.userId;

    //At this point the file is just a raw buffer sitting in the server's RAM
    //made available through req.file attached to it by multer
    if (!req.file) return next(badRequest("No image file was provided"));

    const image = await mediaService.postImage(roomId, userId, req.file);
    return res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles Step 1 of the video upload flow.
 * Controller sends mimeType as a request for an upload video url to AWS
 * @returns uploadUrl (for video) + fileUrl (location)
 */
const getVideoUploadUrl = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const { mimeType } = req.body;

    if (!mimeType) return next(badRequest("mimeType is required"));

    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"];
    if (!allowedTypes.includes(mimeType)) {
      return next(badRequest(`Unsupported video type. Allowed: ${allowedTypes.join(", ")}`));
    }

    const { uploadUrl, fileUrl } = await mediaService.getVideoUploadUrl(roomId, userId, mimeType);
    return res.status(200).json({ uploadUrl, fileUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles Step 1.5 of the video upload flow.
 * No body fields needed — mimeType is always image/jpeg since
 * the client always extracts the thumbnail frame as a JPEG.
 * @returns uploadUrl (for thumbnail) + thumbnailUrl (location)
 */
const getVideoThumbnailUrl = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const { uploadUrl, thumbnailUrl } = await mediaService.getVideoThumbnailUrl(roomId, userId);
    return res.status(200).json({ uploadUrl, thumbnailUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to post video information to database - Final step on the upload video process 
 * @returns posted video
 */
const postVideo = async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const userId = req.user.userId;
    const { title, fileUrl, description, thumbnailUrl, durationSeconds } = req.body;

    if (!title || !fileUrl) return next(badRequest("title and fileUrl are required"));

    const video = await mediaService.postVideo(roomId, userId, {
      title,
      fileUrl,
      description,
      thumbnailUrl,
      durationSeconds,
    });

    return res.status(201).json(video);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete an image from a room 
 * @returns success message
 */
const removeImage = async (req, res, next) => {
  try {
    const { roomId, imageId } = req.params;
    const userId = req.user.userId;
    await mediaService.removeImage(roomId, imageId, userId);
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a video from a room 
 * @returns success message
 */
const removeVideo = async (req, res, next) => {
  try {
    const { roomId, videoId } = req.params;
    const userId = req.user.userId;
    await mediaService.removeVideo(roomId, videoId, userId);
    return res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getImages, getImage,
  getVideos, getVideo,
  postImage, getVideoUploadUrl, getVideoThumbnailUrl, postVideo,
  removeImage, removeVideo
};