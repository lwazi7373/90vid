const connectDB = require("../db/Connect");
const { uploadToS3, deleteFromS3, generatePresignedUrl } = require("../utils/s3Helpers");
const {badRequest, unauthorized, forbidden, notFound, conflict} = require("../errors/httpErrors");

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
 * 
 * @param {*} room 
 * @param {*} permission 
 * @param {*} userId 
 * @param {*} permissionKey 
 * @returns 
 */
const hasAccess = (room, permission, userId, permissionKey) => {
  if (room.createdBy === userId) return true;
  if (permission && permission[permissionKey]) return true;
  return false;
};

////////////////////////////////////////////////////////// Images /////////////////////////////////////////////////////////////////////

const getImages = async (roomId) => {
  const db = await connectDB();
  await getRoomOrThrow(db, roomId);

  const [images] = await db.execute(
    `SELECT 
      i.imageId,
      i.fileUrl,
      i.createdAt,
      u.userId   AS uploadedById,
      u.userName AS uploadedByName
     FROM Images i
     JOIN Users u ON u.userId = i.uploadedBy
     WHERE i.roomId = ?
     ORDER BY i.createdAt DESC`,
    [roomId]
  );

  return images;
};

const getImage = async (roomId, imageId) => {
  const db = await connectDB();
  await getRoomOrThrow(db, roomId);

  const [[image]] = await db.execute(
    `SELECT 
      i.imageId,
      i.fileUrl,
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
  const db = await connectDB();
  const room = await getRoomOrThrow(db, roomId);
  const permission = await getRoomPermission(db, roomId, userId);

  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  // file.buffer and file.mimetype come from multer memoryStorage
  const fileUrl = await uploadToS3(file.buffer, file.mimetype, "images");

  const [result] = await db.execute(
    `INSERT INTO Images (fileUrl, uploadedBy, roomId) VALUES (?, ?, ?)`,
    [fileUrl, userId, roomId]
  );

  return { imageId: result.insertId, fileUrl, roomId, uploadedBy: userId };
};

/**
 * Deletes the image from DB first, then removes the file from S3.
 * DB first so if S3 delete fails, you can retry — better than
 * having the file gone from S3 but the dead URL still in your DB.
 */
const removeImage = async (roomId, imageId, userId) => {
  const db = await connectDB();
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
};

////////////////////////////////////////////////////////// Videos /////////////////////////////////////////////////////////////////////

const getVideos = async (roomId) => {
  const db = await connectDB();
  await getRoomOrThrow(db, roomId);

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

  return videos;
};

const getVideo = async (roomId, videoId) => {
  const db = await connectDB();
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
  const db = await connectDB();
  const room = await getRoomOrThrow(db, roomId);
  const permission = await getRoomPermission(db, roomId, userId);

  if (!hasAccess(room, permission, userId, "canUpload")) {
    throw forbidden("You do not have permission to upload to this room");
  }

  const { uploadUrl, fileUrl } = await generatePresignedUrl(mimeType, "videos");
  return { uploadUrl, fileUrl };
};

const postVideo = async (roomId, userId, { title, description, fileUrl, thumbnailUrl, durationSeconds }) => {
  const db = await connectDB();
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

  return { videoId: result.insertId, title, fileUrl, roomId, uploadedBy: userId };
};

const removeVideo = async (roomId, videoId, userId) => {
  const db = await connectDB();
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
};

module.exports = {
  getImages, getImage, postImage, removeImage,
  getVideos, getVideo, getVideoUploadUrl, postVideo, removeVideo
};