const prisma = require("../config.js");

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const exists = await prisma.wishlist.findFirst({
      where: { userId, productId: Number(productId) },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const item = await prisma.wishlist.create({
      data: {
        userId,
        productId: Number(productId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: item,
    });
  } catch (error) {
    console.error("Error in adding to wishlist ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in adding to wish list",
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            colors: {
              include: {
                sizes: true,
              },
            },
            brand: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const wishlistWithPrices = wishlist.map((item) => {
      const product = item.product;
      let minPrice = Infinity;
      let correspondingOriginalPrice = 0;

      if (product.colors && product.colors.length > 0) {
        product.colors.forEach((color) => {
          if (color.sizes && color.sizes.length > 0) {
            color.sizes.forEach((size) => {
              if (size.price < minPrice) {
                minPrice = size.price;
                correspondingOriginalPrice = size.originalPrice || 0;
              } else if (size.price === minPrice) {
                if ((size.originalPrice || 0) > correspondingOriginalPrice) {
                  correspondingOriginalPrice = size.originalPrice || 0;
                }
              }
            });
          }
        });
      }

      if (minPrice === Infinity) minPrice = 0;

      let discount = 0;
      if (correspondingOriginalPrice > minPrice) {
        discount = Math.round(
          ((correspondingOriginalPrice - minPrice) /
            correspondingOriginalPrice) *
            100
        );
      }

      return {
        ...item,
        product: {
          ...product,
          price: minPrice,
          originalPrice: correspondingOriginalPrice,
          discount,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: wishlistWithPrices,
    });
  } catch (error) {
    console.error("Error in getWishlist ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in adding to wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId: Number(productId),
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    await prisma.wishlist.delete({
      where: { id: item.id },
    });

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Error in removing from wishlist ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in removing from wish list",
    });
  }
};

const checkWishlistStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const exists = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId: Number(productId),
      },
    });

    return res.status(200).json({
      success: true,
      isWishlisted: !!exists,
    });
  } catch (error) {
    console.error("Error in checking wishlist status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in checking wishlist status",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus,
};
