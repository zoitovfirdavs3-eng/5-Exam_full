const { Router } = require("express");
const auth = require("../middlewares/auth");
const { uploadCarImage } = require("../utils/upload");

const r = Router();

// optional helper endpoint
r.post("/car-image", auth(), uploadCarImage, (req, res) => {
  if (!req.file?.filename) return res.status(400).json({ status: 400, message: "Image required" });
  return res.json({ status: 200, url: `/uploads/${req.file.filename}` });
});

module.exports = r;
