const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const adminGuard = require("../guard/admin.guard");

const categoryRouter = Router();

categoryRouter.post("/create", adminGuard, categoryController.CREATE_CATEGORY);

categoryRouter.get("/all",  categoryController.GET_CATEGORIES);

categoryRouter.route("/:id")
.get(categoryController.GET_CATEGORY)
.put(adminGuard ,categoryController.UPDATE_CATEGORY)
.delete(adminGuard, categoryController.DELETE_CATEGORY);

module.exports = categoryRouter;