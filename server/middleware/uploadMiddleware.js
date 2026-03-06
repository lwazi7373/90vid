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

module.exports = { imageUpload };