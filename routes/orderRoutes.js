const router = require("express").Router();
const order = require("../controllers/orderController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, order.placeOrder);
router.get("/", auth, order.getUserOrders);
router.get("/:id", auth, order.getOrderById);

module.exports = router;
