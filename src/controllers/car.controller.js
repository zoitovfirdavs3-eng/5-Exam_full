const { ClientError } = require("shokhijakhon-error-handler");
const { isValidObjectId } = require("mongoose");

const CarModel = require("../models/Car.model");
const CategoryModel = require("../models/Category.model");
const carValidator = require("../utils/validator/car.validator");
const globalError = require("../lib/global-error");
const logger = require("../lib/winston.service");
const { uploadBufferToCloudinary } = require("../services/cloudinary-upload.service");
const globalError = require("../lib/global-error");

// car_category: ObjectId yoki Number bo'lishi mumkin
async function findCategoryByAnyId(rawId) {
  if (rawId === undefined || rawId === null) return null;

  // 1) Agar ObjectId bo'lsa
  if (typeof rawId === "string" && isValidObjectId(rawId)) {
    return CategoryModel.findById(rawId);
  }

  // 2) Aks holda number qilib ko'ramiz
  const n = Number(rawId);
  if (Number.isFinite(n)) {
    return CategoryModel.findOne({ category_id: n });
  }

  return null;
}

function normalizeCarCategory(rawId) {
  if (typeof rawId === "string" && isValidObjectId(rawId)) return rawId;
  const n = Number(rawId);
  if (Number.isFinite(n)) return n;
  return rawId;
}

async function attachCategoryName(carDoc) {
  const car = carDoc.toObject ? carDoc.toObject() : carDoc;
  const cat = await findCategoryByAnyId(car.car_category);
  return {
    ...car,
    car_category_name: cat?.category_name || null,
  };
}

module.exports = {
  async CREATE_CAR(req, res) {
    try {
      logger.debug(`CREATE_CAR attempt with data: ${JSON.stringify(req.body)}`);

      const newCar = req.body;
      await carValidator.validateAsync(newCar, { abortEarly: false });

      const category = await findCategoryByAnyId(newCar.car_category);
      if (!category) throw new ClientError("Category not found", 404);

      // ✅ Rasm Cloudinary'ga yuklanadi (diskga yozilmaydi)
      if (!req.file?.buffer) {
        throw new ClientError("car_image (file) is required", 400);
      }

      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
        folder: process.env.CLOUDINARY_FOLDER || "5-exam/cars",
        resource_type: "image",
      });

      const imageUrl = uploadRes.secure_url;

      const insertCar = await CarModel.create({
        ...newCar,
        car_category: normalizeCarCategory(newCar.car_category),
        car_image: imageUrl,
      });

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
      const cars = await CarModel.find();
      const withCategory = await Promise.all(cars.map(attachCategoryName));
      logger.debug(`GET_CARS success: count=${withCategory.length}`);
      return res.json(withCategory);
    } catch (err) {
      logger.error(`GET_CARS error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async GET_CAR(req, res) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) throw new ClientError("Invalid object id", 400);

      const car = await CarModel.findById(id);
      if (!car) throw new ClientError("Car not found", 404);

      return res.json(await attachCategoryName(car));
    } catch (err) {
      return globalError(err, res);
    }
  },

  async DELETE_CAR(req, res) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) throw new ClientError("Invalid object id !", 400);

      const car = await CarModel.findById(id);
      if (!car) throw new ClientError("Car not found", 404);

      await car.deleteOne();
      return res.json({ message: "Car successfully deleted !", status: 200 });
    } catch (err) {
      return globalError(err, res);
    }
  },

  async UPDATE_CAR(req, res) {
    try {
      const updateData = req.body;
      const { id } = req.params;
      if (!isValidObjectId(id)) throw new ClientError("Invalid object id !", 400);

      const car = await CarModel.findById(id);
      if (!car) throw new ClientError("Car not found", 404);

      // Agar category kelsa tekshirib qo'yamiz
      if (updateData.car_category !== undefined) {
        const category = await findCategoryByAnyId(updateData.car_category);
        if (!category) throw new ClientError("Category not found", 404);
        updateData.car_category = normalizeCarCategory(updateData.car_category);
      }

      await car.updateOne(updateData);
      return res.json({ message: "Car successfully updated !", status: 200 });
    } catch (err) {
      return globalError(err, res);
    }
  },
};
