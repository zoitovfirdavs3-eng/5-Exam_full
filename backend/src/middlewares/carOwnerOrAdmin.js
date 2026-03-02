const Car = require("../models/Car");
const { HttpError } = require("../utils/errors");

module.exports = async function carOwnerOrAdmin(req, res, next) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");

    const car = await Car.findById(req.params.id).select("owner");
    if (!car) throw new HttpError(404, "Car not found");

    if (req.user.role === "admin") return next();

    const ownerId = String(car.owner);
    const userId = String(req.user.sub);

    if (ownerId === userId) return next();
    throw new HttpError(403, "Forbidden");
  } catch (e) {
    next(e);
  }
};
