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
      colors, // Expecting array of { color, imageUrl, sizes: [{ size, stock, price }] }
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

    // Calculate total stock from all sizes
    let totalStock = 0;
    if (colors && Array.isArray(colors)) {
      colors.forEach((c) => {
        if (c.sizes && Array.isArray(c.sizes)) {
          c.sizes.forEach((s) => {
            totalStock += Number(s.stock) || 0;
          });
        }
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
        stockAvailable: totalStock,
        colors: {
          create: colors.map((c) => ({
            color: c.color,
            imageUrl: c.imageUrl,
            sizes: {
              create: c.sizes.map((s) => ({
                size: s.size,
                stock: Number(s.stock),
                price: Number(s.price),
              })),
            },
          })),
        },
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
    console.error("Error adding product:", error);
    return res.status(500).json({
      success: false, // Fixed typo 'message: false'
      message: "Internal Server Error while adding new product",
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        productImages: true,
        colors: {
          include: {
            sizes: true,
          },
        },
        brand: true,
        category: true,
        subCategory: true,
        collection: true,
      },
    });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    // Update click count
    await prisma.product.update({
      where: { id: Number(id) },
      data: { clicks: product.clicks + 1 },
    });

    // Find the cheapest price across all color-size combinations
    let defaultPrice = Infinity;
    let defaultOriginalPrice = 0;
    let availableSizes = [];

    if (product.colors && product.colors.length > 0) {
      const sizeSet = new Set();

      product.colors.forEach((color) => {
        if (color.sizes && color.sizes.length > 0) {
          color.sizes.forEach((sizeVariant) => {
            // Logic to find min price and corresponding original price
            if (sizeVariant.price < defaultPrice) {
              defaultPrice = sizeVariant.price;
              defaultOriginalPrice = sizeVariant.originalPrice || 0;
            } else if (sizeVariant.price === defaultPrice) {
              // If prices are equal, take the one with higher original price (higher discount)
              if ((sizeVariant.originalPrice || 0) > defaultOriginalPrice) {
                defaultOriginalPrice = sizeVariant.originalPrice || 0;
              }
            }
            sizeSet.add(sizeVariant.size);
          });
        }
      });

      if (defaultPrice === Infinity) defaultPrice = 0;
      availableSizes = Array.from(sizeSet);
    }

    // Calculate discount percentage
    let discount = 0;
    if (defaultOriginalPrice > defaultPrice) {
      discount = Math.round(
        ((defaultOriginalPrice - defaultPrice) / defaultOriginalPrice) * 100
      );
    }

    // Add computed fields to the product object
    const productWithPrice = {
      ...product,
      defaultPrice,
      originalPrice: defaultOriginalPrice,
      discount,
      sizes: availableSizes, // For backward compatibility
    };

    return res.status(200).json({ success: true, data: productWithPrice });
  } catch (error) {
    console.log("Error in fetching single product", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching product details",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      q = "", // Alternative search param
      category,
      subcategory,
      brand,
      gender,
      sizes, // Comma-separated sizes
      minPrice,
      maxPrice,
      sort = "latest",
    } = req.query;

    console.log("getAllProducts query:", req.query);

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Search query - use 'q' or 'search'
    const searchTerm = q || search;

    // Sorting logic
    let orderBy = {};
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "popularity":
      case "trending":
        orderBy = { clicks: "desc" };
        break;
      case "price_low":
      case "price_low_to_high":
        // Sorting by nested relation is complex in Prisma, defaulting to createdAt for now
        // or we could sort in memory after fetching if dataset is small
        orderBy = { createdAt: "desc" };
        break;
      case "price_high":
      case "price_high_to_low":
        orderBy = { createdAt: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Build filters
    const filters = { AND: [] };

    // Search filter
    if (searchTerm.trim()) {
      filters.AND.push({
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { shortDescription: { contains: searchTerm, mode: "insensitive" } },
          { longDescription: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }

    // Category filter - multi-select
    if (category) {
      const categories = category.split(",").map((c) => c.trim());
      filters.AND.push({
        OR: categories.map((c) => ({
          category: {
            name: { equals: c, mode: "insensitive" },
          },
        })),
      });
    }

    // Subcategory filter - multi-select
    if (subcategory) {
      const subcategories = subcategory.split(",").map((s) => s.trim());
      filters.AND.push({
        OR: subcategories.map((s) => ({
          subCategory: {
            name: { equals: s, mode: "insensitive" },
          },
        })),
      });
    }

    // Brand filter - multi-select
    if (brand) {
      const brands = brand.split(",").map((b) => b.trim());
      filters.AND.push({
        OR: brands.map((b) => ({
          brand: {
            name: { equals: b, mode: "insensitive" },
          },
        })),
      });
    }

    // Sizes filter - check if product has any of the requested sizes
    if (sizes) {
      const sizeArray = sizes.split(",").map((s) => s.trim());
      filters.AND.push({
        colors: {
          some: {
            sizes: {
              some: {
                size: { in: sizeArray },
              },
            },
          },
        },
      });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : undefined;
      const max = maxPrice ? Number(maxPrice) : undefined;

      filters.AND.push({
        colors: {
          some: {
            sizes: {
              some: {
                price: {
                  gte: min,
                  lte: max,
                },
              },
            },
          },
        },
      });
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters.AND.length > 0 ? filters : {},
        skip,
        take: limitNum,
        orderBy,
        include: {
          productImages: true,
          colors: {
            include: {
              sizes: true,
            },
          },
          brand: true,
          category: true,
          subCategory: true,
          collection: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where: filters.AND.length > 0 ? filters : {} }),
    ]);

    // Calculate defaultPrice and availableSizes for each product
    const productsWithPrice = products.map((product) => {
      let defaultPrice = Infinity;
      let defaultOriginalPrice = 0;
      let availableSizes = [];

      if (product.colors && product.colors.length > 0) {
        const sizeSet = new Set();

        product.colors.forEach((color) => {
          if (color.sizes && color.sizes.length > 0) {
            color.sizes.forEach((sizeVariant) => {
              // Logic to find min price and corresponding original price
              if (sizeVariant.price < defaultPrice) {
                defaultPrice = sizeVariant.price;
                defaultOriginalPrice = sizeVariant.originalPrice || 0;
              } else if (sizeVariant.price === defaultPrice) {
                // If prices are equal, take the one with higher original price (higher discount)
                if ((sizeVariant.originalPrice || 0) > defaultOriginalPrice) {
                  defaultOriginalPrice = sizeVariant.originalPrice || 0;
                }
              }
              sizeSet.add(sizeVariant.size);
            });
          }
        });

        if (defaultPrice === Infinity) defaultPrice = 0;
        availableSizes = Array.from(sizeSet);
      }

      // Calculate discount percentage
      let discount = 0;
      if (defaultOriginalPrice > defaultPrice) {
        discount = Math.round(
          ((defaultOriginalPrice - defaultPrice) / defaultOriginalPrice) * 100
        );
      }

      // Calculate average rating
      let averageRating = 0;
      let reviewCount = 0;
      if (product.reviews && product.reviews.length > 0) {
        reviewCount = product.reviews.length;
        const totalRating = product.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        averageRating = Number((totalRating / reviewCount).toFixed(1));
      }

      return {
        ...product,
        defaultPrice,
        originalPrice: defaultOriginalPrice,
        discount,
        sizes: availableSizes, // For backward compatibility
        rating: averageRating,
        reviewCount,
      };
    });

    // Apply in-memory sorting for price-based sorts
    let sortedProducts = productsWithPrice;
    if (sort === "price_low" || sort === "price_low_to_high") {
      sortedProducts = productsWithPrice.sort(
        (a, b) => a.defaultPrice - b.defaultPrice
      );
    } else if (sort === "price_high" || sort === "price_high_to_low") {
      sortedProducts = productsWithPrice.sort(
        (a, b) => b.defaultPrice - a.defaultPrice
      );
    }

    return res.status(200).json({
      success: true,
      data: sortedProducts,
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
    const { id } = req.params; // Fixed: id is in req.params, not req.params object itself
    const {
      name,
      shortDescription,
      longDescription,
      categoryId,
      subCategoryId,
      brandId,
      imageUrl,
      colors,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product doesn't exists" });
    }
    if (name && name !== existingProduct.name) {
      const nameExists = await prisma.product.findUnique({ where: { name } });
      if (nameExists) {
        return res.status(404).json({
          success: false,
          message: "Another product with this name already exists",
        });
      }
    }

    // Calculate total stock if colors are provided
    let totalStock = existingProduct.stockAvailable;
    let colorsUpdate = {};

    if (colors && Array.isArray(colors)) {
      let newStock = 0;
      colors.forEach((c) => {
        if (c.sizes && Array.isArray(c.sizes)) {
          c.sizes.forEach((s) => {
            newStock += Number(s.stock) || 0;
          });
        }
      });
      totalStock = newStock;

      // Strategy: Delete all existing colors and recreate them
      colorsUpdate = {
        deleteMany: {},
        create: colors.map((c) => ({
          color: c.color,
          imageUrl: c.imageUrl,
          sizes: {
            create: c.sizes.map((s) => ({
              size: s.size,
              stock: Number(s.stock),
              price: Number(s.price),
            })),
          },
        })),
      };
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
        stockAvailable: totalStock,
        colors: colorsUpdate,
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
      success: false,
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

const getTrendingProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        trending: true,
      },
      include: {
        brand: {
          select: {
            name: true,
          },
        },
        colors: {
          include: {
            sizes: {
              select: {
                size: true,
                price: true,
                originalPrice: true,
                stock: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        clicks: "desc",
      },
    });

    // Process products
    const processedProducts = products.map((product) => {
      // Calculate average rating
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      // Calculate min price and corresponding original price
      let minPrice = Infinity;
      let correspondingOriginalPrice = 0;

      product.colors.forEach((color) => {
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
      });

      // Calculate discount
      let discount = 0;
      const finalPrice = minPrice === Infinity ? 0 : minPrice;
      if (correspondingOriginalPrice > finalPrice) {
        discount = Math.round(
          ((correspondingOriginalPrice - finalPrice) /
            correspondingOriginalPrice) *
            100
        );
      }

      return {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl || product.colors[0]?.imageUrl || null,
        rating: avgRating,
        reviewCount: product.reviews.length,
        price: finalPrice,
        originalPrice: correspondingOriginalPrice,
        discount,
        brand: product.brand?.name || null,
      };
    });

    res.json({ success: true, data: processedProducts });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching trending products",
    });
  }
};

module.exports = {
  addProduct,
  getSingleProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
};
