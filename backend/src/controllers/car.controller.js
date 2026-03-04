const Car = require("../models/Car");
const { HttpError } = require("../utils/errors");

exports.list = async (req, res, next) => {
  try {
    const data = await Car.find()
      .populate("car_category", "name image")
      .populate("owner", "first_name last_name email role")
      .sort({ createdAt: -1 });

    // Debug logging for image fields
    console.log("🔍 Cars List Debug - Image Fields:");
    data.forEach((car, index) => {
      console.log(`  Car ${index + 1}:`, {
        id: car._id,
        name: car.car_name,
        car_image: car.car_image,
        hasImage: !!car.car_image,
        imageType: typeof car.car_image,
        imageLength: car.car_image?.length
      });
    });

    // Add imageUrl field for frontend convenience
    const carsWithImageUrl = data.map(car => {
      const carObj = car.toObject();
      if (car.car_image) {
        const publicOrigin = process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`;
        carObj.imageUrl = `${publicOrigin}${car.car_image}`;
      } else {
        carObj.imageUrl = null;
      }
      return carObj;
    });

    res.json({ status: 200, data: carsWithImageUrl });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file?.filename) {
      body.car_image = `/uploads/${req.file.filename}`;
      console.log("🔍 Car Create Debug:", {
        filename: req.file.filename,
        imagePath: body.car_image,
        fileExists: req.file
      });
    }
    const created = await Car.create({ ...body, owner: req.user.sub });
    const withPop = await Car.findById(created._id)
      .populate("car_category", "name image")
      .populate("owner", "first_name last_name email role");
    
    // Add imageUrl field for frontend convenience
    const carObj = withPop.toObject();
    if (carObj.car_image) {
      const publicOrigin = process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`;
      carObj.imageUrl = `${publicOrigin}${carObj.car_image}`;
    } else {
      carObj.imageUrl = null;
    }
    
    console.log("🔍 Car Create Response:", {
      carId: created._id,
      carImage: created.car_image,
      responseImage: withPop.car_image,
      imageUrl: carObj.imageUrl
    });
    
    res.json({ status: 200, data: carObj });
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
    
    // Add imageUrl field for frontend convenience
    const carObj = updated.toObject();
    if (carObj.car_image) {
      const publicOrigin = process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`;
      carObj.imageUrl = `${publicOrigin}${carObj.car_image}`;
    } else {
      carObj.imageUrl = null;
    }
    
    res.json({ status: 200, data: carObj });
  } catch (e) {
    next(e);
  }
};
