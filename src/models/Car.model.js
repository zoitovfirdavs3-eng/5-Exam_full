const { Schema, model } = require("mongoose");

const carSchema = new Schema(
  {
    car_name: {
      type: String,
      required: [true, "Car name is required !"],
    },
    car_category: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: [true, "Car category is required"],
    },
    car_tonirovka: {
      type: String,
      trim: true,
      enum: ["bor", "yo'q"],
      lowercase: true
    },
    car_motor: {
      type: String,
      required: [true, "Car motor is required !"],
    },
    car_year: {
      type: Number,
      required: [true, "Car year is required !"],
    },
    car_color: {
      type: String,
      required: [true, "Car color is required !"],
    },
    car_distance: {
      type: Number,
      required: [true, "Car distance is required !"],
    },
    car_gearbook: {
      type: String,
      trim: true,
      enum: ["avtomat", "mexanik"],
      lowercase: true
    },
    car_description: {
      type: String,
      required: [true, "Car description is required !"],
    },
    car_price: {
      type: Number,
      required: [true, "Car price is required !"],
    },
    car_image: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = model("cars", carSchema);