const prisma = require("../config.js");

const createCollection = async (req, res) => {
  try {
    const {
      name,
      type,
      categoryIds = [],
      productIds = [],
      subCategoryIds = [],
    } = req.body;
    if (!name || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Name and type are required" });
    }
    const collection = await prisma.collection.create({
      data: {
        name,
        type,
        categoryIds: categoryIds.length
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
        productIds: productIds.length
          ? { connect: productIds.map((id) => ({ id })) }
          : undefined,
        subCategoryIds: subCategoryIds.length
          ? { connect: subCategoryIds.map((id) => ({ id })) }
          : undefined,
      },
    });
    if (!collection) {
      return res.status(400).json({
        success: false,
        message: "Error in creating collection",
        data: collection,
      });
    }
    return res.status(200).json({
      success: true,
      message: "New Collection created successfully",
      data: collection,
    });
  } catch (error) {
    console.log("Error in creating collection ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in creating collection",
    });
  }
};

const getAllCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        categories: true,
        products: true,
        subcategories: true,
      },
      orderBy: { id: "desc" },
    });
    if (!collections) {
      return res
        .status(400)
        .json({ success: false, message: "Error in getting all collections" });
    }
    return res
      .status(200)
      .json({ success: true, message: "All collections fetched successfully" });
  } catch (error) {
    console.log("Error in getting all collections ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getting all collections",
    });
  }
};

const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id: Number(id) },
      include: {
        categories: true,
        products: true,
        subcategories: true,
      },
    });
    if (!collection) {
      return res
        .status(400)
        .json({ success: false, message: "Collection not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Collection is fetched successfully by id",
      data: collection,
    });
  } catch (error) {
    console.log("Error in getting collection by id ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in getting a collection by id",
    });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, categoryIds, productIds, subCategoryIds } = req.body;
    const collection = await prisma.collection.findUnique({
      where: { id: Number(id) },
    });
    if (!collection) {
      return res
        .status(400)
        .json({ success: false, message: "Collection not found" });
    }
    const updatedCollection = await prisma.collection.update({
      where: { id: Number(id) },
      data: {
        name: name ?? collection.name,
        type: type ?? collection.type,

        ...(categoryIds && {
          categories: {
            set: categoryIds.map((cid) => ({ id: cid })),
          },
        }),

        ...(productIds && {
          products: {
            set: productIds.map((pid) => ({ id: pid })),
          },
        }),

        ...(subCategoryIds && {
          subcategories: {
            set: subCategoryIds.map((sid) => ({ id: sid })),
          },
        }),
      },
    });
    if (updatedCollection) {
      return res
        .status(400)
        .json({ success: false, message: "Error in updating collection" });
    }
    return res.status(200).json({
      success: true,
      message: "Collection updated succesfully",
      data: updatedCollection,
    });
  } catch (error) {
    console.log("Error while updating collection ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in updating collection",
    });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCollection = await prisma.collection.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCollection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }
    await prisma.collection.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleting collection ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deleting collection",
    });
  }
};

module.exports = {
  createCollection,
  getAllCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
};
