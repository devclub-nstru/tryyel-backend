const prisma = require("../config.js");

const getCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        subcategories: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            categoryId: true,
          },
        },
        brands: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        products: {
          include: {
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
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    // Calculate ratings and prices for products
    const processedCollections = collections.map((collection) => {
      const processedProducts = collection.products.map((product) => {
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
          brandName: product.brand?.name || null,
        };
      });

      return {
        id: collection.id,
        name: collection.name,
        type: collection.type,
        buttonName: collection.buttonName,
        buttonLink: collection.buttonLink,
        items: {
          categories: collection.categories,
          subcategories: collection.subcategories,
          brands: collection.brands.map((b) => ({
            ...b,
            imageUrl: b.logoUrl,
          })),
          products: processedProducts,
        },
      };
    });

    res.json({ success: true, data: processedCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching collections",
    });
  }
};

module.exports = {
  getCollections,
};
