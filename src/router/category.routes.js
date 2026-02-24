const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const authGuard = require("../guard/auth.guard");
const adminGuard = require("../guard/admin.guard");

const categoryRouter = Router();

categoryRouter.post(
  "/create",
  authGuard,
  adminGuard,
  categoryController.CREATE_CATEGORY,
);

categoryRouter.get("/all",  categoryController.GET_CATEGORIES);

categoryRouter.route("/:id")
.get(categoryController.GET_CATEGORY)
.put(authGuard, adminGuard ,categoryController.UPDATE_CATEGORY)
.delete(authGuard, adminGuard, categoryController.DELETE_CATEGORY);

module.exports = categoryRouter;