const router = require("express").Router();
const cart = require("../controllers/cartController");
const auth = require("../middleware/auth");

router.get("/", auth, cart.getCart);
router.post("/add", auth, cart.addToCart);
router.put("/update", auth, cart.updateCartItem);
router.delete("/remove/:itemId", auth, cart.removeCartItem);

module.exports = router;
