const prisma = require("../config.js");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, paymentId } = req.body;
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address is required to place an order",
      });
    }
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.id !== addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery address" });
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
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    for (const item of cart.items) {
      if (item.quantity > item.product.stockAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} has only ${item.product.stockAvailable} items left`,
        });
      }
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        payment: paymentId,
        status: "PENDING",
        total: totalAmount,
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
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockAvailable: item.product.stockAvailable - item.quantity },
      });
    }
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.log("Error while placing the order ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while placing the order",
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalOrders = await prisma.order.count({
      where: { userId },
    });

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!orders) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to get user orders" });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched user orders",
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: page * limit < totalOrders,
      },
    });
  } catch (error) {
    console.log("Error in getting user orders ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getting User orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    // Fetch order with all required relations
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true } },
        address: true,
        history: true,
      },
    });
    if (!order || order.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const productIds = order.items.map((item) => item.productId);
    const userReviews = await prisma.review.findMany({
      where: {
        userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });
    const reviewedProductIds = new Set(userReviews.map((r) => r.productId));
    const updatedItems = order.items.map((item) => ({
      ...item,
      isReviewed: reviewedProductIds.has(item.productId),
    }));
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: {
        ...order,
        items: updatedItems,
      },
    });
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });
    if (order || order.userId != userId) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockAvailable: { increment: item.quantity } },
      });
    }
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: "CANCELLED" },
    });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        oldStatus: "PENDING",
        newStatus: "CANCELLED",
      },
    });
    return res.status(200).json({
      success: true,
      message: "Order cancelled succesfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("Error in cancdlling the order ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in cancelling the order",
    });
  }
};

const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await prisma.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: { include: { product: true } },
        address: true,
        history: true,
      },
    });
    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch all orders for admin",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log("Error in getting all orders for admin ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in gettig all orders for admin",
    });
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;
    const allowedStatus = [
      "PENDING",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!allowedStatus.includes(newStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "invalid order status" });
    }
    const order = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }
    const oldStatus = order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: newStatus },
    });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: updatedOrder.id,
        oldStatus,
        newStatus,
      },
    });
    return res.status(200).json({
      success: false,
      message: "Order status updated",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("Error in updating the status for admin ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error to update status for admin",
    });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersForAdmin,
  updateOrderStatusAdmin,
};
