const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Firstname is required !"],
    },
    last_name: {
      type: String,
      required: [true, "Lastname is required !"],
    },
    age: {
      type: Number,
      required: [true, "Age is required !"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Emais is required !"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required !"],
    },
    otp: {
      type: String,
    },
    otpTime: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["user", "admin"],
      default: "user",
    },
    refresh_token: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = model("users", userSchema);
