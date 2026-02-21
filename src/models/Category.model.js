const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: [true, "Category name is required !"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"]
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = model("categories", categorySchema);