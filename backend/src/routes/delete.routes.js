const { Router } = require("express");
const auth = require("../middlewares/auth");
const deleteController = require("../controllers/delete.controller");

const router = Router();

// All delete routes require authentication
router.use(auth());

// Delete message: DELETE /api/messages/:id?mode=me|everyone
router.delete("/messages/:id", deleteController.deleteMessage);

// Delete conversation: DELETE /api/conversations/:id?mode=me|everyone
router.delete("/conversations/:id", deleteController.deleteConversation);

module.exports = router;
