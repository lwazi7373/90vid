const connectDB = require("../db/Connect");
const sharp = require("sharp"); // Compress images
const { uploadToS3, deleteFromS3, generatePresignedUrl } = require("../utils/s3Helpers");
const {badRequest, forbidden, notFound} = require("../errors/httpErrors");

const { getCache, setCache, deleteCache } = require("../cache/cacheService");
const keys = require("../cache/cacheKeys");
////////////////////////////////////////////////////////// Utility methods /////////////////////////////////////////////////////////////////////
/**
 * Get the room or throw not found error
 * @param {connectDB} db 
 * @param {number} roomId 
 * @returns room
 */
const getRoomOrThrow = async (db, roomId) => {
  const [[room]] = await db.execute(
    `SELECT roomId, roomName, createdBy FROM Rooms WHERE roomId = ?`,
    [roomId]
  );
  if (!room) throw notFound(`Room ${roomId} not found`);
  return room;
};

/**
 * Checks to see if a user can upload and delete in/from this room 
 * @param {connectDB} db 
 * @param {Number} roomId 
 * @param {Number} userId 
 * @returns boolean 
 */
const getRoomPermission = async (db, roomId, userId) => {
  const [[permission]] = await db.execute(
    `SELECT canUpload, canDelete FROM RoomPermissions 
     WHERE roomId = ? AND userId = ?`,
    [roomId, userId]
  );
  return permission ?? null;
};

/**
 * Assess the permission the user has
 * @param {room} room 
 * @param {boolean or null} permission 
 * @param {Number} userId 
 * @param {String} permissionKey 
 * @returns boolean
 */
const hasAccess = (room, permission, userId, permissionKey) => {
  if (room.createdBy === userId) return true;
  if (permission && permission[permissionKey]) return true;
  return false;
};

////////////////////////////////////////////////////////// Images /////////////////////////////////////////////////////////////////////

/**
 * Both the Original (fileURl) and the compressed (thumbnailUrl) are returned
 * To ensure the correct representation for the context
 * @param {number} roomId 
 * @returns images
 */
const getImages = async (roomId) => {
  const db = connectDB;

  // Get the Cache key for all the images in the room 
  const cacheKey = keys.media.images(roomId);
  await getRoomOrThrow(db, roomId);

  // Try to get from cache first
  try {
    const cachedImages = await getCache(cacheKey);
    if (cachedImages) {
      console.log("Cache HIT: getImages");
      return cachedImages;
    }
  } catch (err) {
    console.error("Cache error (getImages):", err);
  }

  console.log("Cache MISS: getImages");

  const [images] = await db.execute(
    `SELECT 
      i.imageId,
      i.fileUrl,
      i.thumbnailUrl,
      i.createdAt,
      u.userId   AS uploadedById,
      u.userName AS uploadedByName
     FROM Images i
     JOIN Users u ON u.userId = i.uploadedBy
     WHERE i.roomId = ?
     ORDER BY i.createdAt DESC`,
    [roomId]
  );

  // Store in cache
  try {
    await setCache(cacheKey, images, 120); // shorter TTL (2 min)
  } catch (err) {
    console.error("Cache set error (getImages):", err);
  }

  return images;
};

/**
 * Get's a specific image
 * Both the Original (fileURl) and the compressed (thumbnailUrl) are returned for consistency
 * @param {number} roomId 
 * @param {number} imageId 
 * @returns image
 */
const getImage = async (roomId, imageId) => {
  const db = connectDB;
  await getRoomOrThrow(db, roomId);

  const [[image]] = await db.execute(
    `SELECT 
      i.imageId,
      i.fileUrl,
      i.thumbnailUrl,
      i.createdAt,
      u.userId   AS uploadedById,
      u.userName AS uploadedByName
     FROM Images i
     JOIN Users u ON u.userId = i.uploadedBy
     WHERE i.imageId = ? AND i.roomId = ?`,
    [imageId, roomId]
  );

  if (!image) throw notFound(`Image ${imageId} not found in room ${roomId}`);
  return image;
};

/**
 * Receives the file buffer and mimetype from multer (via controller),
 * uploads to S3, then saves the returned URL to the DB.
 */
const postImage = async (roomId, userId, file) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);
  const permission = await getRoomPermission(db, roomId, userId);

  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  // Upload original to S3
  const fileUrl = await uploadToS3(file.buffer, file.mimetype, "images/originals");

  // Generate thumbnail using Sharp (resize to 400px wide, maintain aspect ratio)
  const thumbnailBuffer = await sharp(file.buffer)
    .resize({ width: 400 })
    .jpeg({ quality: 70 })
    .toBuffer();

  // Upload thumbnail to S3
  // thumbnail is always saved as image/jpeg regardless of the original format 
  const thumbnailUrl = await uploadToS3(thumbnailBuffer, "image/jpeg", "images/thumbnails");

  const [result] = await db.execute(
    `INSERT INTO Images (fileUrl, thumbnailUrl, uploadedBy, roomId) VALUES (?, ?, ?, ?)`,
    [fileUrl, thumbnailUrl, userId, roomId]
  );

  // Invalidate on post action
  try {
    await deleteCache(keys.media.images(roomId));
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (postImage):", err);
  }

  return { imageId: result.insertId, fileUrl, thumbnailUrl, roomId, uploadedBy: userId };
};

/**
 * Deletes the image from DB first, then removes the file from S3.
 * DB first so if S3 delete fails, you can retry — better than
 * having the file gone from S3 but the dead URL still in your DB.
 */
const removeImage = async (roomId, imageId, userId) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);

  const [[image]] = await db.execute(
    `SELECT imageId, fileUrl FROM Images WHERE imageId = ? AND roomId = ?`,
    [imageId, roomId]
  );
  if (!image) throw notFound(`Image ${imageId} not found in room ${roomId}`);

  const permission = await getRoomPermission(db, roomId, userId);
  if (!hasAccess(room, permission, userId, "canDelete")) {
    throw forbidden("You do not have permission to delete images from this room");
  }

  await db.execute(`DELETE FROM Images WHERE imageId = ?`, [imageId]);
  await deleteFromS3(image.fileUrl);

  // Invalidate on remove action
  try {
    await deleteCache(keys.media.images(roomId));
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (removeImage):", err);
  }

};

////////////////////////////////////////////////////////// Videos /////////////////////////////////////////////////////////////////////

const getVideos = async (roomId) => {
  const db = connectDB;
  // Get the Cache key for all the videos in the room 
  const cacheKey = keys.media.videos(roomId);

  await getRoomOrThrow(db, roomId);

  // Try to get from cache first
  try {
    const cachedVideos = await getCache(cacheKey);
    if (cachedVideos) {
      console.log("Cache HIT: getVideos");
      return cachedVideos;
    }
  } catch (err) {
    console.error("Cache error (getVideos):", err);
  }

  console.log("Cache MISS: getVideos");

  const [videos] = await db.execute(
    `SELECT 
      v.videoId,
      v.title,
      v.description,
      v.fileUrl,
      v.thumbnailUrl,
      v.durationSeconds,
      v.createdAt,
      u.userId   AS uploadedById,
      u.userName AS uploadedByName
     FROM Videos v
     JOIN Users u ON u.userId = v.uploadedBy
     WHERE v.roomId = ?
     ORDER BY v.createdAt DESC`,
    [roomId]
  );

  try {
    await setCache(cacheKey, videos, 120);
  } catch (err) {
    console.error("Cache set error (getVideos):", err);
  }

  return videos;
};

const getVideo = async (roomId, videoId) => {
  const db = connectDB;
  await getRoomOrThrow(db, roomId);

  const [[video]] = await db.execute(
    `SELECT 
      v.videoId,
      v.title,
      v.description,
      v.fileUrl,
      v.thumbnailUrl,
      v.durationSeconds,
      v.createdAt,
      u.userId   AS uploadedById,
      u.userName AS uploadedByName
     FROM Videos v
     JOIN Users u ON u.userId = v.uploadedBy
     WHERE v.videoId = ? AND v.roomId = ?`,
    [videoId, roomId]
  );

  if (!video) throw notFound(`Video ${videoId} not found in room ${roomId}`);
  return video;
};

/**
 * Video upload is a two step process:
 *
 * Step 1 — getVideoUploadUrl:
 * Client requests a presigned URL from our API.
 * We check permissions first, then generate the URL.
 * Client uploads the video file directly to S3 using that URL.
 * 
 * Step 2 — postVideo (confirm):
 * After the client finishes uploading to S3, it calls our API
 * with the metadata (title, fileUrl, etc.) to save to the DB.
 */
const getVideoUploadUrl = async (roomId, userId, mimeType) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);
  const permission = await getRoomPermission(db, roomId, userId);

  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  const { uploadUrl, fileUrl } = await generatePresignedUrl(mimeType, "videos");
  return { uploadUrl, fileUrl };
};

/**
 * Step 1.5 of the video upload flow.
 * 
 * Full video upload flow reminder:
 *   Step 1 — Client calls /videos/presigned-url    -  gets a presigned URL to upload the video directly to S3
 *   Step 1.5 — Client calls /videos/thumbnail-url  -  gets a presigned URL to upload the thumbnail frame directly to S3
 *   Step 2 — Client calls /videos/confirm          -  saves video metadata (fileUrl + thumbnailUrl) to the DB
 * 
 * Why this exists:
 * Videos never pass through our server, so we can't generate thumbnails server-side (unlike images where
 * the buffer passes through multer and we use Sharp). The client extracts a frame using the Canvas API,
 * then uses this presigned URL to upload that frame directly to S3 under videos/thumbnails/.
 * The returned thumbnailUrl is what the client sends in the confirm step.
 */
const getVideoThumbnailUrl = async (roomId, userId) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);
  const permission = await getRoomPermission(db, roomId, userId);

  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  // Thumbnail frames are always JPEG regardless of the video format
  const { uploadUrl, fileUrl: thumbnailUrl } = await generatePresignedUrl("image/jpeg", "videos/thumbnails");
  return { uploadUrl, thumbnailUrl };
};


const postVideo = async (roomId, userId, { title, description, fileUrl, thumbnailUrl, durationSeconds }) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);

  if (!title || !fileUrl) throw badRequest("title and fileUrl are required");

  const permission = await getRoomPermission(db, roomId, userId);
  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  const [result] = await db.execute(
    `INSERT INTO Videos (title, description, fileUrl, thumbnailUrl, uploadedBy, roomId, durationSeconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description ?? null, fileUrl, thumbnailUrl ?? null, userId, roomId, durationSeconds ?? null]
  );

  // Invalidate on post action
  try {
    await deleteCache(keys.media.videos(roomId));
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (postVideo):", err);
  }

  return { videoId: result.insertId, title, fileUrl, roomId, uploadedBy: userId };
};

const removeVideo = async (roomId, videoId, userId) => {
  const db = connectDB;
  const room = await getRoomOrThrow(db, roomId);

  const [[video]] = await db.execute(
    `SELECT videoId, fileUrl FROM Videos WHERE videoId = ? AND roomId = ?`,
    [videoId, roomId]
  );
  if (!video) throw notFound(`Video ${videoId} not found in room ${roomId}`);

  const permission = await getRoomPermission(db, roomId, userId);
  if (!hasAccess(room, permission, userId, "canDelete")) {
    throw forbidden("You do not have permission to delete videos from this room");
  }

  await db.execute(`DELETE FROM Videos WHERE videoId = ?`, [videoId]);
  await deleteFromS3(video.fileUrl);

  // Invalidate on remove action
  try {
    await deleteCache(keys.media.videos(roomId));
    await deleteCache(keys.user.profile(userId));
  } catch (err) {
    console.error("Cache delete error (postVideo):", err);
  }
};

module.exports = {
  getImages, getImage, postImage, removeImage,
  getVideos, getVideo, getVideoUploadUrl, getVideoThumbnailUrl ,postVideo, removeVideo
};