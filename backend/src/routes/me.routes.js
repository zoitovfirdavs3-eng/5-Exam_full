const { Router } = require("express");
const auth = require("../middlewares/auth");
const meController = require("../controllers/me.controller");
const { changePasswordSchema, updateProfileSchema } = require("../validators/me.validator");
const validate = require("../middlewares/validate");

const router = Router();

// All routes require authentication
router.use(auth());

router.get("/", meController.getProfile);
router.put("/", validate(updateProfileSchema), meController.updateProfile);
router.put("/password", validate(changePasswordSchema), meController.changePassword);
router.get("/cars", meController.getMyListings);
router.get("/wishlist", meController.getMyWishlist);
router.delete("/wishlist/:carId", meController.removeFromWishlist);

module.exports = router;
