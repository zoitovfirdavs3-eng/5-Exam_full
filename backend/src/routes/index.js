const { Router } = require("express");
const authRoutes = require("./auth.routes");
const categoryRoutes = require("./category.routes");
const carRoutes = require("./car.routes");
const chatRoutes = require("./chat.routes");
const uploadRoutes = require("./upload.routes");
const deleteRoutes = require("./delete.routes");
const metaRoutes = require("./meta.routes");
const meRoutes = require("./me.routes");

const router = Router();

// Public routes (no auth required)
router.use("/", metaRoutes); // GET /api/meta

// Protected routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/cars", carRoutes);
router.use("/chat", chatRoutes);
router.use("/upload", uploadRoutes);
router.use("/", deleteRoutes); // Direct routes for messages and conversations
router.use("/me", meRoutes);

module.exports = router;
