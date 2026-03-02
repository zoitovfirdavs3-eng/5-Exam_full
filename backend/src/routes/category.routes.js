const { Router } = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createCategorySchema, updateCategorySchema } = require("../validators/category");
const ctrl = require("../controllers/category.controller");

const r = Router();

r.get("/", ctrl.list);
r.post("/", auth("admin"), validate(createCategorySchema), ctrl.create);
r.put("/:id", auth("admin"), validate(updateCategorySchema), ctrl.update);

r.delete("/:id", auth("admin"), ctrl.remove);

module.exports = r;
