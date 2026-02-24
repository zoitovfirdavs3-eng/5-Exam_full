const { Router } = require("express");
const carController = require("../controllers/car.controller");
const authGuard = require("../guard/auth.guard");
const { uploadCarImage } = require("../middlewares/upload.middleware");

const carRouter = Router();

// ✅ Avval statik routelar
carRouter.get("/all", carController.GET_CARS);
carRouter.post(
  "/create",
  authGuard,
  uploadCarImage.single("car_image"),
  carController.CREATE_CAR
);

// ✅ Keyin dynamic :id
carRouter
  .route("/:id")
  .get(carController.GET_CAR)
  .put(authGuard, carController.UPDATE_CAR)
  .delete(authGuard, carController.DELETE_CAR);

module.exports = carRouter;
