const router = require("express").Router();
const wishlist = require("../controllers/wishlistController");
const auth = require("../middleware/auth");

router.get("/", auth, wishlist.getWishlist);
router.post("/add", auth, wishlist.addToWishlist);
router.delete("/remove/:productId", auth, wishlist.removeFromWishlist);

module.exports = router;
