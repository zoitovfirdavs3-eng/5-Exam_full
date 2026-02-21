const { Router } = require("express");
const carController = require("../controllers/car.controller");
const carPhotoGuard = require("../guard/car-photo.guard");

const carRouter = Router();

// ✅ Avval statik routelar
carRouter.get("/all", carController.GET_CARS);
carRouter.post("/create", carPhotoGuard, carController.CREATE_CAR);

// ✅ Keyin dynamic :id
carRouter
  .route("/:id")
  .get(carController.GET_CAR)
  .put(carController.UPDATE_CAR)
  .delete(carController.DELETE_CAR);

module.exports = carRouter;
