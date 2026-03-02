const { Router } = require("express");
const auth = require("../middlewares/auth");
const carOwnerOrAdmin = require("../middlewares/carOwnerOrAdmin");
const validate = require("../middlewares/validate");
const { createCarSchema, updateCarSchema } = require("../validators/car");
const ctrl = require("../controllers/car.controller");
const { uploadCarImage } = require("../utils/upload");

const r = Router();

r.get("/", ctrl.list);

// multipart/form-data (image) or json
r.post("/", auth(), uploadCarImage, validate(createCarSchema), ctrl.create);
r.put("/:id", auth(), carOwnerOrAdmin, uploadCarImage, validate(updateCarSchema), ctrl.update);

r.delete("/:id", auth(), carOwnerOrAdmin, ctrl.remove);

module.exports = r;
