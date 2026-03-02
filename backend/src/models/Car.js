const { Schema, model, Types } = require("mongoose");

const carSchema = new Schema(
  {
    car_name: { type: String, required: true, trim: true },
    car_category: { type: Types.ObjectId, ref: "categories", required: true },
    car_tonirovka: { type: Boolean, default: false },
    car_motor: { type: String, required: true, trim: true },
    car_year: { type: Number, required: true, min: 1950, max: 2035 },
    car_color: { type: String, required: true, trim: true },
    car_distance: { type: String, required: true, trim: true },
    car_gearbook: { type: String, default: "" },
    car_description: { type: String, required: true, trim: true },
    car_price: { type: Number, required: true, min: 0 },
    car_image: { type: String, default: "" },
    owner: { type: Types.ObjectId, ref: "users", required: true }
  },
  { timestamps: true }
);

module.exports = model("cars", carSchema);
