const User = require("../models/User");
const Car = require("../models/Car");
const { HttpError } = require("../utils/errors");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub)
      .select("-password -password_hash -refresh_token");
    if (!user) throw new HttpError(404, "Foydalanuvchi topilmadi");
    
    res.json({ 
      status: 200, 
      message: "Profile retrieved", 
      data: user 
    });
  } catch (e) {
    next(e);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, age } = req.body;
    const userId = req.user.sub;
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { first_name, last_name, age }, 
      { new: true, runValidators: true }
    ).select("-password -password_hash -refresh_token");
    
    if (!user) throw new HttpError(404, "User not found");
    
    res.json({ 
      status: 200, 
      message: "Profile updated", 
      data: user 
    });
  } catch (e) {
    next(e);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      throw new HttpError(400, "New passwords do not match");
    }
    
    if (newPassword.length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }
    
    const user = await User.findById(req.user.sub);
    if (!user) throw new HttpError(404, "User not found");
    
    const hash = user.password || user.password_hash;
    const isValid = await bcrypt.compare(oldPassword, hash);
    
    if (!isValid) {
      throw new HttpError(401, "Current password is incorrect");
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.sub, { 
      password: newPasswordHash,
      password_hash: newPasswordHash 
    });
    
    res.json({ 
      status: 200, 
      message: "Password changed successfully" 
    });
  } catch (e) {
    next(e);
  }
};

exports.getMyListings = async (req, res, next) => {
  try {
    const cars = await Car.find({ owner: req.user.sub })
      .populate("car_category", "name image")
      .sort({ createdAt: -1 });
    
    res.json({ 
      status: 200, 
      message: "My listings retrieved", 
      data: cars 
    });
  } catch (e) {
    next(e);
  }
};

exports.getMyWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select("wishlist");
    if (!user) throw new HttpError(404, "User not found");
    
    const wishlistCars = await Car.find({ 
      _id: { $in: user.wishlist || [] } 
    }).populate("car_category", "name image")
      .populate("owner", "first_name last_name email");
    
    res.json({ 
      status: 200, 
      message: "Wishlist retrieved", 
      data: wishlistCars 
    });
  } catch (e) {
    next(e);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { carId } = req.params;
    
    await User.findByIdAndUpdate(
      req.user.sub,
      { $pull: { wishlist: carId } }
    );
    
    res.json({ 
      status: 200, 
      message: "Removed from wishlist" 
    });
  } catch (e) {
    next(e);
  }
};
