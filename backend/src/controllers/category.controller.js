const Category = require("../models/Category");
const { HttpError } = require("../utils/errors");

exports.list = async (req, res, next) => {
  try {
    const data = await Category.find().sort({ createdAt: -1 });
    res.json({ status: 200, data });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const created = await Category.create({ name, image });
    res.status(201).json({ status: 201, data: created });
  } catch (e) {
    // duplicate key
    if (String(e).includes("E11000")) return next(new HttpError(409, "Category already exists"));
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) throw new HttpError(404, "Category not found");
    res.json({ status: 200, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};


exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) throw new HttpError(404, "Category not found");
    res.json({ status: 200, data: updated });
  } catch (e) {
    next(e);
  }
};
