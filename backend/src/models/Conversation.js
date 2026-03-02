const { Schema, model, Types } = require("mongoose");

// Conversation is either:
// - support: user <-> admin (type: "support")
// - car: buyer <-> seller for a specific car (type: "car")

const conversationSchema = new Schema(
  {
    type: { type: String, enum: ["support", "car"], required: true },
    car: { type: Types.ObjectId, ref: "cars", default: null },
    participants: [{ type: Types.ObjectId, ref: "users", required: true }],
    support_owner: { type: Types.ObjectId, ref: "users", sparse: true, unique: true },
    last_message_at: { type: Date, default: null },
    // Soft delete fields
    hidden_for: [{ type: Types.ObjectId, ref: "users" }],
    deleted_for_everyone: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    deleted_by: { type: Types.ObjectId, ref: "users", default: null },
  },
  { timestamps: true }
);

// a user can have only one support conversation
conversationSchema.index({ type: 1, participants: 1 });
conversationSchema.index({ type: 1, car: 1, participants: 1 });
conversationSchema.index({ hidden_for: 1 });
conversationSchema.index({ deleted_for_everyone: 1 });

module.exports = model("conversations", conversationSchema);
