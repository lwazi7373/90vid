const multer = require("multer");

// Store file in memory as a Buffer (we forward it straight to S3, never touch disk)
const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF and WEBP images are allowed"));
    }
  },
});

// When someone uploads a file that's too large or the wrong type, 
// Multer throws its own error — but it doesn't go through next(error) automatically,
// So errorHandler.js won't catch it cleanly.
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { imageUpload, handleUploadError};