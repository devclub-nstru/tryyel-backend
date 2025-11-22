const prisma = require("../config.js");

const getOrCreateCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: userId });
  if (!cart) {
    await prisma.cart.create({
      data: { userId },
    });
  }
  return cart;
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status({ success: false, message: "productId is required" });
    }
    const cart = await getOrCreateCart(userId);
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }
    if (product.stockAvailable < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockAvailable} units are available`,
      });
    }

    const existingProduct = await prisma.cartItem.findFirst({
      where: { cartId: cart.id },
    });

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + quantity;
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${
            product.stockAvailable - existingProduct.quantity
          } extra units are available.`,
        });
      }
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingProduct.id,
        },
        data: {
          quantity: existingProduct.quantity + quantity,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: updateCartItem,
      });
    } else {
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
      if (!newCartItem) {
        return res
          .status(400)
          .json({ success: false, message: "Unable to add new item to cart" });
      }
      return res.status(200).json({
        success: true,
        message: "New item added to cart successfully",
        data: newCartItem,
      });
    }
  } catch (error) {
    console.log("Server error while adding item to cart");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while adding item to cart",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!cart) {
      return res
        .status(400)
        .json({ success: false, message: "unable to fetch cart details" });
    }
    return res.status(200).json({
      success: true,
      message: "Cart data fetched successfully",
      data: cart || { items: [] },
    });
  } catch (error) {
    console.log("Error in fetching cart", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in fetching cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status({
        success: false,
        message: "Quantity should be atleast 1",
      });
    }
    const cart = await getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: Number(itemId) },
    });
    if (!item || item.cartId !== cart.id) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: Number(itemId) },
      data: { quantity },
    });
    if (!updatedCartItem) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update cart item" });
    }
    return res.status(200).json({
      success: false,
      message: "Cart updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    console.log("Error while updating cart item", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while updating cart item",
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const cart = await getOrCreateCart(userId);
    const item = await prisma.cart.findFirst({ where: { id: Number(itemId) } });
    if (!item || item.cartId !== cart.id) {
      return res
        .status(400)
        .json({ success: false, message: "Cart item not found" });
    }
    await prisma.cartItem.delete({ where: { id: Number(itemId) } });
    return res
      .status(200)
      .json({ success: true, message: "Cart item deleted successfully" });
  } catch (error) {
    console.log("Error in removing cart item ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in removing cart item",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "Cart Cleared successfully" });
  } catch (error) {
    console.log("Error in clearing cart ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
