const { Router } = require("express");
const auth = require("../middlewares/auth");
const ctrl = require("../controllers/chat.controller");

const r = Router();

// Barcha suhbatlar ro'yxati
r.get("/conversations", auth(), ctrl.listConversations);

// Support chat ochish
r.post("/support", auth(), ctrl.openSupport);

// Mashina chat ochish
r.post("/car/:carId", auth(), ctrl.openCarChat);

// Xabarlar
r.get("/:id/messages", auth(), ctrl.listMessages);
r.post("/:id/messages", auth(), ctrl.sendMessage);

module.exports = r;
