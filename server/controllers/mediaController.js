const mediaService = require("../services/mediaService");
const { badRequest } = require("../errors/httpErrors");

const getImages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const images = await mediaService.getImages(roomId);
    return res.status(200).json({ results: images, count: images.length });
  } catch (error) {
    next(error);
  }
};

const getImage = async (req, res, next) => {
  try {
    const { roomId, imageId } = req.params;
    const image = await mediaService.getImage(roomId, imageId);
    return res.status(200).json(image);
  } catch (error) {
    next(error);
  }
};

const getVideos = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const videos = await mediaService.getVideos(roomId);
    return res.status(200).json({ results: videos, count: videos.length });
  } catch (error) {
    next(error);
  }
};

const getVideo = async (req, res, next) => {
  try {
    const { roomId, videoId } = req.params;
    const video = await mediaService.getVideo(roomId, videoId);
    return res.status(200).json(video);
  } catch (error) {
    next(error);
  }
};

const postImage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    if (!req.file) return next(badRequest("No image file was provided"));

    const image = await mediaService.postImage(roomId, userId, req.file);
    return res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

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

const postVideo = async (req, res, next) => {
  try {
    const { roomId } = req.params;
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
  postImage, getVideoUploadUrl, postVideo,
  removeImage, removeVideo
};