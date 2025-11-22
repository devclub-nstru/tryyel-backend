const prisma = require("../config.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../config.js");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "addressId is required",
      });
    }
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Invalid address",
      });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }
    for (const item of cart.items) {
      if (item.quantity > item.product.stockAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" has only ${item.product.stockAvailable} items left`,
        });
      }
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order amount must be greater than 0",
      });
    }
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        total: totalAmount,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        history: {
          create: {
            newStatus: "PENDING",
          },
        },
      },
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // INR paise
      currency: "INR",
      receipt: `order_${order.id}`,
    });
    return res.status(201).json({
      success: true,
      message: "Razorpay order created",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error in creating razorpay order ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in creating Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }
    const stringToSign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(stringToSign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: true },
    });
    if (!order || order.userId !== userId) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Order is not in PENDING state",
      });
    }
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: order.total,
        paymentStatus: true,
        date: new Date(),
      },
    });
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        paymentId: transaction.id,
      },
    });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        oldStatus: "PENDING",
        newStatus: "CONFIRMED",
      },
    });
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockAvailable: { decrement: item.quantity },
        },
      });
    }
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return res.status(200).json({
      success: true,
      message: "Payment verified, transaction stored, and order confirmed",
      data: {
        order: updatedOrder,
        transaction,
      },
    });
  } catch (error) {
    console.error("Error in verifing razorpay payment ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in verifying payment",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
