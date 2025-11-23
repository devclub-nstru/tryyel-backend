const router = require("express").Router();
const wishlist = require("../controllers/wishlistController.js");
const auth = require("../middleware/auth.js");

router.get("/", auth, wishlist.getWishlist);
router.post("/add", auth, wishlist.addToWishlist);
router.delete("/remove/:productId", auth, wishlist.removeFromWishlist);

module.exports = router;
