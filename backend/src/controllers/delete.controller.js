const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { HttpError } = require("../utils/errors");

// Delete message (soft delete)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mode = "me" } = req.query; // "me" or "everyone"
    const userId = req.user.sub;

    const message = await Message.findById(id);
    if (!message) throw new HttpError(404, "Xabar topilmadi");

    // Get conversation to check participant
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) throw new HttpError(404, "Chat topilmadi");

    // Check if user is participant
    const isParticipant = conversation.participants.some(p => 
      String(p) === String(userId)
    );
    if (!isParticipant) throw new HttpError(403, "Siz bu chatda emassiz");

    if (mode === "me") {
      // Delete only for me
      if (!message.deleted_for.includes(userId)) {
        message.deleted_for.push(userId);
      }
      await message.save();
    } else if (mode === "everyone") {
      // Delete for everyone (only message owner or admin)
      const isOwner = String(message.from) === String(userId);
      const isAdmin = req.user.role === "admin";
      
      if (!isOwner && !isAdmin) {
        throw new HttpError(403, "Faqat xabar egasi yoki admin hamma uchun o'chirishi mumkin");
      }

      message.deleted_for_everyone = true;
      message.deleted_at = new Date();
      message.deleted_by = userId;
      message.text = "Xabar o'chirildi"; // Optional: replace text
      await message.save();
    } else {
      throw new HttpError(400, "Noto'g'ri rejim");
    }

    res.json({
      status: 200,
      message: mode === "me" ? "Xabar siz uchun o'chirildi" : "Xabar hamma uchun o'chirildi"
    });
  } catch (e) {
    next(e);
  }
};

// Delete conversation (soft delete)
exports.deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mode = "me" } = req.query; // "me" or "everyone"
    const userId = req.user.sub;

    const conversation = await Conversation.findById(id);
    if (!conversation) throw new HttpError(404, "Chat topilmadi");

    // Check if user is participant
    const isParticipant = conversation.participants.some(p => 
      String(p) === String(userId)
    );
    if (!isParticipant) throw new HttpError(403, "Siz bu chatda emassiz");

    if (mode === "me") {
      // Hide conversation for me
      if (!conversation.hidden_for.includes(userId)) {
        conversation.hidden_for.push(userId);
      }
      await conversation.save();
    } else if (mode === "everyone") {
      // Delete for everyone (only admin or conversation creator)
      const isAdmin = req.user.role === "admin";
      
      if (!isAdmin) {
        throw new HttpError(403, "Faqat admin chatni hamma uchun o'chirishi mumkin");
      }

      conversation.deleted_for_everyone = true;
      conversation.deleted_at = new Date();
      conversation.deleted_by = userId;
      await conversation.save();

      // Optionally delete all messages for everyone
      await Message.updateMany(
        { conversation: id },
        { 
          deleted_for_everyone: true,
          deleted_at: new Date(),
          deleted_by: userId,
          text: "Xabar o'chirildi"
        }
      );
    } else {
      throw new HttpError(400, "Noto'g'ri rejim");
    }

    res.json({
      status: 200,
      message: mode === "me" ? "Chat siz uchun o'chirildi" : "Chat hamma uchun o'chirildi"
    });
  } catch (e) {
    next(e);
  }
};
