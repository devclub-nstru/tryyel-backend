const prisma = require("../config.js");

const createSubcategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Sub category name is required" });
    }
    const catId = Number(categoryId);
    const category = await prisma.category.findUnique({ where: { id: catId } });
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "No parent category found" });
    }
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        categoryId: catId,
      },
    });
    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists for this category",
      });
    }
    const newSubCategory = await prisma.subCategory.create({
      data: {
        name: name.trim(),
        categoryId: catId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "New sub category created",
      data: newSubCategory,
    });
  } catch (error) {
    console.log("Error in creating sub category");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in creating a subcategory",
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategoryId = Number(id);
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!existingSubCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Sub catergory not found" });
    }
    await prisma.subCategory.delete({ where: { id: subCategoryId } });
    return res
      .status(200)
      .json({ success: false, message: "Sub category deleted successfully" });
  } catch (error) {
    console.log("Erorr in deleting sub category", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deleting sub category",
    });
  }
};

module.exports = {
  createSubcategory,
  deleteSubCategory,
};
