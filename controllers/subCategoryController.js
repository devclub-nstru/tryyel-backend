const prisma = require("../config.js");

const addSubCategory = async (req, res) => {
  try {
    const { name, categoryId, collectionId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and categoryId are required",
      });
    }

    const exists = await prisma.subCategory.findFirst({
      where: {
        name,
        categoryId: Number(categoryId),
      },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "SubCategory already exists under this category",
      });
    }

    const newSubCategory = await prisma.subCategory.create({
      data: {
        name,
        categoryId: Number(categoryId),
        collectionId: collectionId ? Number(collectionId) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "SubCategory created successfully",
      data: newSubCategory,
    });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding subcategory",
    });
  }
};

const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: true,
        products: true,
        collection: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching subcategories",
    });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await prisma.subCategory.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        products: true,
        collection: true,
      },
    });

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching subcategory",
    });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, collectionId } = req.body;

    const updated = await prisma.subCategory.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(collectionId && { collectionId: Number(collectionId) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating subcategory",
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.subCategory.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting subcategory",
    });
  }
};

module.exports = {
  addSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};
