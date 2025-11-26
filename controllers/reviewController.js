const prisma = require("../config.js");
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "productId and rating are required",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId },
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment || null,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    console.log("Error in adding review ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in adding review",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const reviews = await prisma.review.findMany({
      where: { productId: Number(productId) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(200).json({
      success: true,
      message: "Product reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.log("Error in getting product reviews ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getting product reviews",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
    });
    if (!review || review.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        rating: rating || review.rating,
        comment: comment !== undefined ? comment : review.comment,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.log("Error in updating review ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in updating review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
    });
    if (!review || review.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    await prisma.review.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleting review ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deleting review",
    });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
};
