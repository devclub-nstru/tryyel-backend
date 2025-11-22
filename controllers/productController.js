const prisma = require("../config.js");

const addProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      longDescription,
      categoryId,
      subCategoryId,
      brandId,
      imageUrl,
      stockAvailable,
      sizes,
    } = req.body;
    const existingProduct = await prisma.product.findUnique({
      where: { name },
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }
    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId,
        subCategoryId,
        brandId,
        imageUrl,
        shortDescription,
        longDescription,
        stockAvailable,
        sizes,
      },
    });
    if (!newProduct) {
      return res.status(400).json({
        success: false,
        message: "Unexpected Error while adding a new product",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "New product added successfully" });
  } catch (error) {
    return res.status(500).json({
      message: false,
      message: "Internal Server Error while addig new product",
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }
    await prisma.product.update({
      where: { id },
      data: { clicks: product.clicks + 1 },
    });
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error in fetching single product", error);
    return res.status(500).json({
      success: false,
      message: "Internal Sever Error while fetching product details",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      categoryName,
      subCategoryName,
      collectionId,
      minPrice,
      maxPrice,
      sort = "latest",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    let orderBy = {};

    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "price_low_to_high":
        orderBy = {
          productVariants: {
            _min: {
              price: "asc",
            },
          },
        };
        break;
      case "price_high_to_low":
        orderBy = {
          productVariants: {
            _max: {
              price: "desc",
            },
          },
        };
        break;
      case "trending":
        orderBy = { clicks: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const filters = { AND: [] };
    if (search.trim()) {
      filters.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { longDescription: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (categoryName) {
      filters.AND.push({
        category: {
          name: { contains: categoryName, mode: "insensitive" },
        },
      });
    }
    if (subCategoryName) {
      filters.AND.push({
        subCategory: {
          name: { contains: subCategoryName, mode: "insensitive" },
        },
      });
    }
    if (collectionId) {
      filters.AND.push({
        collectionId: Number(collectionId),
      });
    }
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : undefined;
      const max = maxPrice ? Number(maxPrice) : undefined;

      filters.AND.push({
        productVariants: {
          some: {
            ...(min !== undefined && { price: { gte: min } }),
            ...(max !== undefined && { price: { lte: max } }),
          },
        },
      });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take: limitNum,
        orderBy,
        include: {
          productImages: true,
          productVariants: true,
          brand: true,
          category: true,
          subCategory: true,
          collection: true,
        },
      }),
      prisma.product.count({ where: filters }),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log("Error while getting all products ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching all products",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params;
    const {
      name,
      shortDescription,
      longDescription,
      categoryId,
      subCategoryId,
      imageUrl,
      stockAvailable,
      sizes,
    } = req.body;
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product doesn't exists" });
    }
    if (name !== existingProduct.name) {
      const nameExists = await prisma.product.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(404).json({
          success: false,
          message: "Another product with this name already exists",
        });
      }
    }
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        shortDescription,
        longDescription,
        categoryId,
        subCategoryId,
        brandId,
        imageUrl,
        stockAvailable,
        sizes,
      },
    });
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Error in updating the product" });
    }
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updating product ", error);
    return res.status(500).json({
      message: false,
      message: "Internal Server Error while updating the product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }
    await prisma.product.delete({ where: { id: Number(id) } });
    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully " });
  } catch (error) {
    console.log("Error in deleting the product", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while deleting the product",
    });
  }
};

module.exports = {
  addProduct,
  getSingleProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
