const prisma = require("../config.js");

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const existing = await prisma.category.findUnique({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    const newCategory = await prisma.category.create({
      data: { name: name.trim() },
    });
    if (!newCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to create a new category" });
    }
    return res.status(200).json({
      success: true,
      message: "category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.log("Error in creating a new category", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating a new category",
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    if (!categories) {
      return res
        .status(400)
        .json({ success: false, message: "No categories found" });
    }
    return res.status(200).json({ success: false, data: categories });
  } catch (error) {
    console.log("Error in fetching all categories", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in fetching all categories",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const categoryId = Number(id);
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });
    }
    const duplicateName = await prisma.category.findUnique({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        NOT: { id: categoryId },
      },
    });
    if (duplicateName) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name: name.trim() },
    });
    if (!updated) {
      return res
        .status(400)
        .json({ success: false, message: "Error in updating category" });
    }
    return res.status(200).json({
      success: true,
      message: "category updated successfully",
      data: updated,
    });
  } catch (error) {
    console.log("Error in updating category");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in updating category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = Number(id);
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });
    }
    await prisma.category.delete({ where: { id: categoryId } });
    return res
      .status(200)
      .json({ success: true, message: "category deleted successfully" });
  } catch (error) {
    console.log("Error in deleting cateogry", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deleting category",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
