const path = require("path");
const { globalError, ClientError } = require("shokhijakhon-error-handler");
const CarModel = require("../models/Car.model");
const { isValidObjectId } = require("mongoose");
const carValidator = require("../utils/validator/car.validator");
const CategoryModel = require("../models/Category.model");
const logger = require("../lib/winston.service");

module.exports = {
  async CREATE_CAR(req, res) {
    try {
      logger.debug(`CREATE_CAR attempt with data: ${JSON.stringify(req.body)}`);
      let newCar = req.body;
      await carValidator.validateAsync(newCar, {abortEarly: false});
      let findCategory = await CategoryModel.findById(newCar.car_category);
      if (!findCategory) {
        logger.warn(
          `CREATE_CAR request: category not found ${newCar.car_category}`,
        );
        throw new ClientError("Category not found", 404);
      };
      if(req.filename) {
        req.files.car_image.mv( path.join( process.cwd(), "uploads", "carPhotos", req.filename ) )
      }
      let insertCar = await CarModel.create({...newCar, car_image: req.filename});
      logger.info(
        `Car successfully created with data: ${JSON.stringify(req.body)}`,
      );
      return res.status(201).json({
        message: "Car successfully created !",
        status: 201,
        id: insertCar._id,
      });
    } catch (err) {
      logger.error(`CREATE_CAR error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async GET_CARS(req, res) {
    try {
      const cars = await CarModel.find().populate("car_category", {
        category_name: 1,
        _id: 0,
      });
      logger.debug(`GET_CARS request: ${JSON.stringify(req.query)}`);
      logger.debug(`GET_CARS success: count=${cars.length}`);
      return res.json(cars);
    } catch (err) {
      logger.error(`GET_CARS error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async GET_CAR(req, res) {
    try {
      let { id } = req.params;
      if (!isValidObjectId(id)) throw new ClientError("Invalid object id", 400);
      const car = await CarModel.findById(id).populate("car_category", {
        category_name: 1,
        _id: 0,
      });

      if (!car) throw new ClientError("Car not found", 404);
      return res.json(car);
    } catch (err) {
      return globalError(err, res);
    }
  },
  async DELETE_CAR(req, res) {
    try {
      let { id } = req.params;
      if (!isValidObjectId(id))
        throw new ClientError("Invalid object id !", 400);
      let findCar = await CarModel.findById(id);
      if (!findCar) throw new ClientError("Car not found", 404);
      await findCar.deleteOne();
      return res.json({ message: "Car successfully deleted !", status: 200 });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async UPDATE_CAR(req, res) {
    try {
      let updateData = req.body;
      let { id } = req.params;
      if (!isValidObjectId(id))
        throw new ClientError("Invalid object id !", 400);
      let findCar = await CarModel.findById(id);
      if (!findCar) throw new ClientError("Car not found", 404);
      await findCar.updateOne(updateData);
      return res.json({ message: "Car successfully updated !", status: 200 });
    } catch (err) {
      return globalError(err, res);
    }
  },
};
