const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    // Eski DB'larda car_category int bo'lib ketgan bo'lishi mumkin.
    // Shuning uchun category_id (raqam) ni ham qo'llab-quvvatlaymiz.
    category_id: {
      type: Number,
      unique: true,
      sparse: true,
    },
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