const prisma = require("../config.js");

const addHomeCategory = async (req, res) => {
  try {
    const { categotyId } = req.body;
    if (!categotyId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }
    const catId = Number(categotyId);
    const category = await prisma.category.findUnique({ where: { id: catId } });
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });
    }
    const existingCategory = await prisma.homeCategory.findFirst({
      where: { categoryId: catId },
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already added to home categories",
      });
    }
    const newHomeCategory = await prisma.homeCategory.create({
      data: {
        categoryId: catId,
      },
    });
    if (!newHomeCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Error in adding home category" });
    }
    return res.status(200).json({
      success: false,
      message: "Home category added successfully",
      data: newHomeCategory,
    });
  } catch (error) {
    console.log("Error in adding home category");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in adding home category",
    });
  }
};

const getHomeCategories = async (req, res) => {
  try {
    const homeCategories = await prisma.homeCategory.findMany({
      include: {
        category: {
          include: {
            subCategories: true,
          },
        },
      },
    });
    return res.status(200).json({ success: true, data: homeCategories });
  } catch (error) {
    console.log("Error in fetching home categories");
    return res.status(500).json({
      success: false,
      message: "Internal Server in fetching Home Categories",
    });
  }
};

const removeHomeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const hcId = Number(id);
    const existingHomeCategory = await prisma.homeCategory.findFirst({
      where: { categoryId: hcId },
    });
    if (!existingHomeCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Home category entry not found" });
    }
    await prisma.homeCategory.delete({ where: { categoryId: hcId } });
    return res
      .status(200)
      .json({ success: false, message: "Home category removed successfuly" });
  } catch (error) {
    console.log("Error in removing home category", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in removing home category",
    });
  }
};

module.exports = {
  addHomeCategory,
  getHomeCategories,
  removeHomeCategory,
};
