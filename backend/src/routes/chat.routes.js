const { Router } = require("express");
const auth = require("../middlewares/auth");
const ctrl = require("../controllers/chat.controller");

const r = Router();

// Debug: Check if handlers are loaded
console.log("DEBUG chat handlers:", {
  listConversations: typeof ctrl.listConversations,
  openSupport: typeof ctrl.openSupport,
  openCarChat: typeof ctrl.openCarChat,
  listMessages: typeof ctrl.listMessages,
  sendMessage: typeof ctrl.sendMessage
});

// list conversations
r.get("/conversations", auth(), ctrl.listConversations);

// open/get support conversation
r.post("/support", auth(), ctrl.openSupport);

// open/get car conversation with seller/buyer
r.post("/car/:carId", auth(), ctrl.openCarChat);

// messages
r.get("/:id/messages", auth(), ctrl.listMessages);
r.post("/:id/messages", auth(), ctrl.sendMessage);

module.exports = r;
