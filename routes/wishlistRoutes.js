const router = require("express").Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController.js");
const auth = require("../middleware/auth.js");

router.get("/", auth, getWishlist);
router.post("/add", auth, addToWishlist);
router.delete("/remove/:productId", auth, removeFromWishlist);

module.exports = router;
