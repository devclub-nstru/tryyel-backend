const router = require("express").Router();
const cart = require("../controllers/cartController.js");
const auth = require("../middleware/auth.js");

router.get("/", auth, cart.getCart);
router.post("/add", auth, cart.addToCart);
router.put("/update/:itemId", auth, cart.updateCartItem);
router.delete("/remove/:itemId", auth, cart.removeCartItem);
router.delete("/clear", auth, cart.clearCart);

module.exports = router;
