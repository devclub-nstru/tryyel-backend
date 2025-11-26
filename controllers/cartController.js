const prisma = require("../config.js");

const getOrCreateCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
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
    const { productId, productColorId, productSizeId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const cart = await getOrCreateCart(userId);
    const product = await prisma.product.findFirst({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    // Validate variant selection if provided
    if (productColorId && productSizeId) {
      const sizeVariant = await prisma.productSize.findFirst({
        where: { id: productSizeId, colorId: productColorId },
      });

      if (!sizeVariant) {
        return res.status(400).json({
          success: false,
          message: "Invalid color/size combination",
        });
      }

      if (sizeVariant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${sizeVariant.stock} units are available for this variant`,
        });
      }
    } else if (product.stockAvailable < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockAvailable} units are available`,
      });
    }

    // Check for existing cart item with same variant
    const existingProduct = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: Number(productId),
        productColorId: Number(productColorId) || null,
        productSizeId: Number(productSizeId) || null,
      },
    });

    if (existingProduct) {
      // Update quantity of existing item
      const newQuantity = existingProduct.quantity + quantity;
      const updatedCartItem = await prisma.cartItem.update({
        where: {
          id: existingProduct.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: updatedCartItem,
      });
    } else {
      // Create new cart item with variant info
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          productColorId: Number(productColorId) || null,
          productSizeId: Number(productSizeId) || null,
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
    console.log("Server error while adding item to cart", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while adding item to cart",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                colors: {
                  include: {
                    sizes: true,
                  },
                },
              },
            },
            productColor: {
              include: {
                sizes: true,
              },
            },
            productSize: true,
          },
        },
      },
    });
    if (!cart) {
      return res
        .status(200)
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
      return res.status(400).json({
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
      success: true,
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
    const item = await prisma.cartItem.findFirst({
      where: { id: Number(itemId) },
    });
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
