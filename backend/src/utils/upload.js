const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".jpg";
    const name = `car_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpg", "image/jpeg", "image/webp"].includes(file.mimetype);
  if (!ok) return cb(new Error("Invalid image format. Only png/jpg/jpeg/webp"));
  cb(null, true);
};

const uploadCarImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("image");

module.exports = { uploadCarImage };
