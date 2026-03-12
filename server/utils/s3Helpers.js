/**
 * s3Helpers.js is a utility file that acts as the bridge between the Node app and S3.
 * Rather than writing S3 upload/delete logic repeatedly in every service, we write it once here and call it from anywhere.
 * It exposes exactly two functions, one for putting a file into S3, one for removing it.
 */

const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const s3 = require("../config/s3");

/**
 * Uploads a file buffer to S3. (Just images in this case)
 * @param {Buffer} fileBuffer - the raw file bytes from multer
 * @param {string} mimeType   - e.g. "image/jpeg"
 * @param {string} folder     - e.g. "images" (so that the S3 bucket stays organised into folders rather than dumping everything flat.)
 * @returns {string} the public URL of the uploaded file
 */
const uploadToS3 = async (fileBuffer, mimeType, folder) => {
  const extension = mimeType.split("/")[1];
  // uuidv4() generates a random unique string like "a3f2c1d4-..." so no two uploads ever collide
  const key = `${folder}/${uuidv4()}.${extension}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  }));

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * Deletes a file from S3 by its full URL. (either an image or video)
 * @param {string} fileUrl - the full S3 URL stored in your DB
 */
const deleteFromS3 = async (fileUrl) => {
  const url = new URL(fileUrl);
  const key = url.pathname.slice(1); // removes the leading "/"

  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }));
};

/**
 * Generates a presigned URL the client can use to upload a video directly to S3 without going through the API.
 * The URL expires in 15 minutes.
 * Returns both the upload URL (for the client to PUT to) and the final fileUrl (to save in the DB after upload confirms).
 */
const generatePresignedUrl = async (mimeType, folder) => {
  const extension = mimeType.split("/")[1];
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 900s = 15 min
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl };
};


module.exports = { uploadToS3, deleteFromS3, generatePresignedUrl};