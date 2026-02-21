const { globalError, ClientError } = require("shokhijakhon-error-handler");
const CategoryModel = require("../models/Category.model");
const createCategoryValidator = require("../utils/validator/category.validator");
const { isValidObjectId } = require("mongoose");
const CarModel = require("../models/Car.model");
const logger = require("../lib/winston.service");

module.exports = {
  async CREATE_CATEGORY(req, res) {
    try {
      logger.debug(
        `CREATE CATEGORY attempt with data: ${JSON.stringify(req.body)}`,
      );
      let newCategory = req.body;
      await createCategoryValidator.validateAsync(newCategory, {abortEarly: false});
      let insertCategory = await CategoryModel.create(newCategory);
      logger.info(
        `Category successfully created with data: ${JSON.stringify(req.body)}`,
      );
      return res.status(201).json({
        message: "Category successfully created !",
        status: 201,
        id: insertCategory._id,
      });
    } catch (err) {
      logger.error(`CREATE_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async GET_CATEGORIES(req, res) {
    try {
      let categories = await CategoryModel.find();
      logger.debug(`GET_CATEGORIES request: ${JSON.stringify(req.query)}`);
      logger.debug(`GET_CATEGORIES success: count=${categories.length}`);
      return res.json(categories);
    } catch (err) {
      logger.error(`GET_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async GET_CATEGORY(req, res) {
    try {
      logger.debug(
        `GET_CATEGORY request: params=${JSON.stringify(req.params)}`,
      );
      let { id } = req.params;
      if (!isValidObjectId(id)) {
        logger.warn(`GET_CATEGORY invalid id: ${id}`);
        throw new ClientError("Invalid Object id", 400);
      }
      let findCategory = await CategoryModel.findById(id);
      if (!findCategory) {
        logger.warn(`GET_CATEGORY not found: id=${id}`);
        throw new ClientError("Category not found !", 404);
      }
      logger.debug(`GET_CATEGORY success: id=${id}`);
      return res.json(findCategory);
    } catch (err) {
      logger.error(`GET_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async DELETE_CATEGORY(req, res) {
    try {
      logger.debug(
        `DELETE_CATEGORY request: params=${JSON.stringify(req.params)}`,
      );
      let { id } = req.params;
      if (!isValidObjectId(id)) {
        logger.warn(`DELETE_CATEGORY invalid id: ${id}`);
        throw new ClientError("Invalid Object id !", 400);
      }
      let findCategory = await CategoryModel.findById(id);
      if (!findCategory) {
        logger.warn(`DELETE_CATEGORY not found: id=${id}`);
        throw new ClientError("Category not found !", 404);
      }
      await CarModel.deleteMany({ car_category: id });
      await findCategory.deleteOne();
      logger.debug(`DELETE_CATEGORY success: id=${id}`);
      return res.json({
        message: "Category and category cars successfully deleted !",
        status: 200,
      });
    } catch (err) {
      logger.error(`DELETE_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
  async UPDATE_CATEGORY(req, res) {
    try {
      logger.debug(
        `UPDATE_CATEGORY request: params=${JSON.stringify(req.params)} body=${JSON.stringify(req.body)}`,
      );
      let updateDate = req.body;
      let { id } = req.params;
      if (!isValidObjectId(id)) {
        logger.warn(`UPDATE_CATEGORY invalid id: ${id}`);
        throw new ClientError("Invalid Object id !", 400);
      }
      let findCategory = await CategoryModel.findById(id);
      if (!findCategory) {
        logger.warn(`UPDATE_CATEGORY not found: id=${id}`);
        throw new ClientError("Category not found !", 404);
      }
      await findCategory.updateOne(updateDate);
      logger.debug(`UPDATE_CATEGORY success: id=${id}`);
      return res.json({
        message: "Category successfully updated !",
        status: 200,
      });
    } catch (err) {
      logger.error(`UPDATE_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
};
