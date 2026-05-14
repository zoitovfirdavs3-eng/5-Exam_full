const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Car = require("../models/Car");
const { HttpError } = require("../utils/errors");

async function getAnyAdminId() {
  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) throw new HttpError(500, "Admin topilmadi");
  return String(admin._id);
}

async function ensureParticipantOrAdmin(req, convId) {
  const conv = await Conversation.findById(convId);
  if (!conv) throw new HttpError(404, "Conversation topilmadi");

  if (req.user.role === "admin") return conv;
  const me = String(req.user.sub);
  const ok = (conv.participants || []).some((p) => String(p) === me);
  if (!ok) throw new HttpError(403, "Ruxsat yo'q");
  return conv;
}

exports.listConversations = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const conversations = await Conversation.find({
      participants: userId,
      hidden_for: { $ne: userId },
      deleted_for_everyone: { $ne: true },
    })
      .populate("car", "car_name car_image")
      .populate("participants", "first_name last_name email role")
      .sort({ last_message_at: -1, updatedAt: -1 });

    res.json({ status: 200, data: conversations });
  } catch (e) {
    next(e);
  }
};

exports.openSupport = async (req, res, next) => {
  try {
    const adminId = await getAnyAdminId();
    const me = String(req.user.sub);

    // Admin o'z support chatini ochmasin
    if (me === adminId) {
      throw new HttpError(400, "Admin support chat ocha olmaydi");
    }

    const participants = [me, adminId];

    let conv = await Conversation.findOne({
      type: "support",
      support_owner: me,
    });

    if (!conv) {
      conv = await Conversation.create({
        type: "support",
        participants,
        support_owner: me,
        last_message_at: null,
      });
      await Message.create({
        conversation: conv._id,
        from: adminId,
        to: me,
        text: "Salom! Support chatga xush kelibsiz. Muammoingizni yozing.",
        read_by: [adminId],
      });
      conv.last_message_at = new Date();
      await conv.save();
    }

    const withPop = await Conversation.findById(conv._id)
      .populate("car", "car_name car_image")
      .populate("participants", "first_name last_name email role");

    res.json({ status: 200, data: withPop });
  } catch (e) {
    next(e);
  }
};

exports.openCarChat = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId).select("owner car_name");
    if (!car) throw new HttpError(404, "Mashina topilmadi");

    const me = String(req.user.sub);
    const sellerId = String(car.owner);

    // O'z mashinasi bilan chat ochib bo'lmaydi (ixtiyoriy qoida)
    const participants = me === sellerId ? [sellerId] : [me, sellerId];

    let conv = await Conversation.findOne({
      type: "car",
      car: carId,
      participants: { $all: participants },
    });

    if (!conv) {
      conv = await Conversation.create({
        type: "car",
        car: carId,
        participants,
      });
    }

    const withPop = await Conversation.findById(conv._id)
      .populate("car", "car_name car_image")
      .populate("participants", "first_name last_name email role");

    res.json({ status: 200, data: withPop });
  } catch (e) {
    next(e);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const userId = req.user.sub;

    const conv = await Conversation.findById(id);
    if (!conv) throw new HttpError(404, "Conversation topilmadi");

    const isParticipant = conv.participants.some(
      (p) => String(p) === String(userId)
    );
    const isAdmin = req.user.role === "admin";

    if (!isParticipant && !isAdmin) throw new HttpError(403, "Ruxsat yo'q");

    const messages = await Message.find({
      conversation: id,
      deleted_for_everyone: { $ne: true },
      deleted_for: { $ne: userId },
    })
      .populate("from", "first_name last_name email role")
      .populate("to", "first_name last_name email role")
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({ status: 200, data: messages });
  } catch (e) {
    next(e);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conv = await ensureParticipantOrAdmin(req, id);

    const text = String(req.body.text || "").trim();
    if (!text) throw new HttpError(400, "Matn kiritilishi shart");

    let to = null;
    if (req.user.role !== "admin") {
      if (conv.type === "support") {
        to = await getAnyAdminId();
      } else {
        const other = (conv.participants || []).find(
          (p) => String(p) !== String(req.user.sub)
        );
        to = other ? String(other) : null;
      }
    } else {
      const toUserId = req.body.toUserId ? String(req.body.toUserId) : null;
      if (toUserId) {
        to = toUserId;
      } else {
        const other = (conv.participants || []).find(
          (p) => String(p) !== String(req.user.sub)
        );
        to = other ? String(other) : null;
      }
    }

    const msg = await Message.create({
      conversation: conv._id,
      from: req.user.sub,
      to,
      text,
      read_by: [req.user.sub],
    });

    conv.last_message_at = new Date();
    await conv.save();

    const populated = await Message.findById(msg._id).populate(
      "from",
      "first_name last_name email role"
    );
    res.status(201).json({ status: 201, data: populated });
  } catch (e) {
    next(e);
  }
};
