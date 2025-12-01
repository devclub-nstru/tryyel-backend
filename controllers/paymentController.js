const prisma = require("../config.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

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
          include: {
            product: true,
            productSize: true,
            productColor: true,
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }
    // Validate stock and calculate total
    let totalAmount = 0;
    for (const item of cart.items) {
      // Get price from productSize if available, otherwise skip
      const itemPrice = item.productSize?.price || 0;

      if (itemPrice === 0) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" does not have a valid price`,
        });
      }

      // Check stock from productSize if available, otherwise use product stock
      const availableStock =
        item.productSize?.stock ?? item.product.stockAvailable;

      if (item.quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" has only ${availableStock} items left`,
        });
      }

      totalAmount += item.quantity * itemPrice;
    }

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
            price: item.productSize?.price || 0,
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

    // Fetch cart before stock decrement to access cart items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    for (const item of order.items) {
      // If there's a productSizeId in the original cart item, decrement size stock
      const cartItem = cart?.items.find(
        (ci) => ci.productId === item.productId
      );

      if (cartItem?.productSizeId) {
        await prisma.productSize.update({
          where: { id: cartItem.productSizeId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      } else {
        // Fallback to product stock if no size variant
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockAvailable: { decrement: item.quantity },
          },
        });
      }
    }

    // Clear cart items after successful payment
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
