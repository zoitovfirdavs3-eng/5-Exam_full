const Car = require("../models/Car");
const { HttpError } = require("../utils/errors");

exports.list = async (req, res, next) => {
  try {
    const data = await Car.find()
      .populate("car_category", "name image")
      .populate("owner", "first_name last_name email role")
      .sort({ createdAt: -1 });

    res.json({ status: 200, data });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file?.filename) {
      body.car_image = `/uploads/${req.file.filename}`;
    }
    const created = await Car.create({ ...body, owner: req.user.sub });
    const withPop = await Car.findById(created._id)
      .populate("car_category", "name image")
      .populate("owner", "first_name last_name email role");
    res.status(201).json({ status: 201, data: withPop });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) throw new HttpError(404, "Car not found");
    res.json({ status: 200, message: "Deleted" });
  } catch (e) {
    next(e);
  }
};


exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    if (req.file?.filename) {
      body.car_image = `/uploads/${req.file.filename}`;
    }
    const updated = await Car.findByIdAndUpdate(id, body, { new: true })
      .populate("car_category", "name image")
      .populate("owner", "first_name last_name email role");
    if (!updated) throw new HttpError(404, "Car not found");
    res.json({ status: 200, data: updated });
  } catch (e) {
    next(e);
  }
};
