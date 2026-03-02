const { Schema, model, Types } = require("mongoose");

const messageSchema = new Schema(
  {
    conversation: { type: Types.ObjectId, ref: "conversations", required: true },
    from: { type: Types.ObjectId, ref: "users", required: true },
    to: { type: Types.ObjectId, ref: "users", default: null },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    read_by: [{ type: Types.ObjectId, ref: "users" }],
    // Soft delete fields
    deleted_for: [{ type: Types.ObjectId, ref: "users" }],
    deleted_for_everyone: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    deleted_by: { type: Types.ObjectId, ref: "users", default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ deleted_for: 1 });
messageSchema.index({ deleted_for_everyone: 1 });

module.exports = model("messages", messageSchema);
