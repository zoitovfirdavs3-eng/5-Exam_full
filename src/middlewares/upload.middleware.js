const multer = require("multer");

// RAM'ga saqlaymiz (diskga yozmaymiz)
const storage = multer.memoryStorage();

const uploadCarImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype);
    if (!ok) return cb(new Error("Invalid image format. Only png/jpg/jpeg"));
    cb(null, true);
  },
});

module.exports = { uploadCarImage };
