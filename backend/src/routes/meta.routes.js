const { Router } = require("express");
const metaController = require("../controllers/meta.controller");

const router = Router();

// Public meta endpoint - no auth required
router.get("/meta", metaController.getMeta);

module.exports = router;
