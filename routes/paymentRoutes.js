const express = require("express");
const auth = require("../middleware/auth.js");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// Create Razorpay order
router.post("/create-order", auth, createRazorpayOrder);

// Verify payment
router.post("/verify", auth, verifyRazorpayPayment);

module.exports = router;
