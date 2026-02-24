const { ClientError } = require("shokhijakhon-error-handler");
const { isValidObjectId } = require("mongoose");

const CategoryModel = require("../models/Category.model");
const CarModel = require("../models/Car.model");
const createCategoryValidator = require("../utils/validator/category.validator");
const globalError = require("../lib/global-error");
const logger = require("../lib/winston.service");

async function findCategoryByParam(idParam) {
  // ObjectId bo'lsa
  if (isValidObjectId(idParam)) {
    const cat = await CategoryModel.findById(idParam);
    return { cat, by: "_id" };
  }
  // Aks holda: int
  const n = Number(idParam);
  if (Number.isFinite(n)) {
    const cat = await CategoryModel.findOne({ category_id: n });
    return { cat, by: "category_id" };
  }
  return { cat: null, by: null };
}

module.exports = {
  async CREATE_CATEGORY(req, res) {
    try {
      logger.debug(
        `CREATE_CATEGORY attempt with data: ${JSON.stringify(req.body)}`,
      );

      const newCategory = req.body;
      await createCategoryValidator.validateAsync(newCategory, {
        abortEarly: false,
      });

      const inserted = await CategoryModel.create(newCategory);

      return res.status(201).json({
        message: "Category successfully created !",
        status: 201,
        id: inserted._id,
      });
    } catch (err) {
      logger.error(`CREATE_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async GET_CATEGORIES(req, res) {
    try {
      const categories = await CategoryModel.find();
      logger.debug(`GET_CATEGORIES success: count=${categories.length}`);
      return res.json(categories);
    } catch (err) {
      logger.error(`GET_CATEGORIES error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async GET_CATEGORY(req, res) {
    try {
      const { id } = req.params;
      const { cat } = await findCategoryByParam(id);
      if (!cat) throw new ClientError("Category not found !", 404);
      return res.json(cat);
    } catch (err) {
      logger.error(`GET_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },

  async DELETE_CATEGORY(req, res) {
    try {
      const { id } = req.params;
      const { cat, by } = await findCategoryByParam(id);
      if (!cat) throw new ClientError("Category not found !", 404);

      // Categoryga tegishli car'larni ham o'chiramiz
      const queries = [];
      if (by === "_id") queries.push({ car_category: cat._id });
      if (cat.category_id !== undefined && cat.category_id !== null)
        queries.push({ car_category: cat.category_id });

      if (queries.length) await CarModel.deleteMany({ $or: queries });
      await cat.deleteOne();

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
      const { id } = req.params;
      const updateData = req.body;

      const { cat } = await findCategoryByParam(id);
      if (!cat) throw new ClientError("Category not found !", 404);

      // agar category_id yuborilsa, number ekanini tekshirib qo'yamiz
      if (updateData.category_id !== undefined) {
        const n = Number(updateData.category_id);
        if (!Number.isFinite(n)) throw new ClientError("Invalid category_id", 400);
        updateData.category_id = n;
      }

      await cat.updateOne(updateData);
      return res.json({ message: "Category successfully updated !", status: 200 });
    } catch (err) {
      logger.error(`UPDATE_CATEGORY error: ${err.message}`);
      return globalError(err, res);
    }
  },
};
