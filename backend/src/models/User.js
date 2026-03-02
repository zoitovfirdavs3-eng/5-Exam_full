const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 12, max: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // Backward-compat (old DB)
    password_hash: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refresh_token: { type: String, default: null },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "cars" }]
  },
  { timestamps: true }
);

module.exports = model("users", userSchema);
