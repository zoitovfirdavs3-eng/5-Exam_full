const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = model("categories", categorySchema);
