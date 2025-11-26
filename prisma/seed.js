const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create Brands
  const gucci = await prisma.brand.upsert({
    where: { name: "Gucci" },
    update: {
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Gucci_logo.svg/2560px-Gucci_logo.svg.png",
    },
    create: {
      name: "Gucci",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Gucci_logo.svg/2560px-Gucci_logo.svg.png",
    },
  });

  const armani = await prisma.brand.upsert({
    where: { name: "Armani" },
    update: {
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Giorgio_Armani_logo.svg/2560px-Giorgio_Armani_logo.svg.png",
    },
    create: {
      name: "Armani",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Giorgio_Armani_logo.svg/2560px-Giorgio_Armani_logo.svg.png",
    },
  });

  const ysl = await prisma.brand.upsert({
    where: { name: "YSL" },
    update: {
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Yves_Saint_Laurent_Logo.svg/1200px-Yves_Saint_Laurent_Logo.svg.png",
    },
    create: {
      name: "YSL",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Yves_Saint_Laurent_Logo.svg/1200px-Yves_Saint_Laurent_Logo.svg.png",
    },
  });

  const prada = await prisma.brand.upsert({
    where: { name: "Prada" },
    update: {
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Prada-Logo.svg/2560px-Prada-Logo.svg.png",
    },
    create: {
      name: "Prada",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Prada-Logo.svg/2560px-Prada-Logo.svg.png",
    },
  });

  console.log("✓ Brands created");

  // Create Categories with subcategories
  const clothing = await prisma.category.upsert({
    where: { id: 1 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "Clothing",
      imageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { id: 2 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "Accessories",
      imageUrl:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop",
    },
  });

  console.log("✓ Categories created");

  // Create Subcategories
  const tshirts = await prisma.subCategory.upsert({
    where: { id: 1 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "T-Shirts",
      categoryId: clothing.id,
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop",
    },
  });

  const dresses = await prisma.subCategory.upsert({
    where: { id: 2 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "Dresses",
      categoryId: clothing.id,
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
    },
  });

  const bags = await prisma.subCategory.upsert({
    where: { id: 3 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "Handbags",
      categoryId: accessories.id,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=400&auto=format&fit=crop",
    },
  });

  const watches = await prisma.subCategory.upsert({
    where: { id: 4 },
    update: {
      imageUrl:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop",
    },
    create: {
      name: "Watches",
      categoryId: accessories.id,
      imageUrl:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=400&auto=format&fit=crop",
    },
  });

  console.log("✓ Subcategories created");

  // Delete existing products and collections to avoid conflicts
  await prisma.cartItem.deleteMany({}); // Delete cart items first due to foreign key constraints
  await prisma.collection.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("✓ Existing products and collections deleted");

  // Create Products with new Color-Size structure
  const products = [
    {
      name: "Luxury Silk Evening Gown",
      categoryId: clothing.id,
      brandId: gucci.id,
      imageUrl:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2424&auto=format&fit=crop",
      shortDescription: "Elegant silk evening gown with intricate detailing",
      longDescription:
        "Handcrafted from the finest silk with delicate embroidery. Perfect for formal occasions and red carpet events. Features a flattering silhouette and luxurious draping.",
      stockAvailable: 15,
      trending: true,
      colors: [
        {
          color: "Emerald Green",
          imageUrl:
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=2424&auto=format&fit=crop",
          sizes: [
            { size: "XS", stock: 3, price: 12500, originalPrice: 15000 },
            { size: "S", stock: 3, price: 12500, originalPrice: 15000 },
            { size: "M", stock: 3, price: 12500, originalPrice: 15000 },
            { size: "L", stock: 3, price: 12500, originalPrice: 15000 },
            { size: "XL", stock: 3, price: 12500, originalPrice: 15000 },
          ],
        },
      ],
    },
    {
      name: "Tailored Wool Blazer",
      categoryId: clothing.id,
      brandId: armani.id,
      imageUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2671&auto=format&fit=crop",
      shortDescription: "Classic Italian tailored blazer",
      longDescription:
        "Premium wool blazer with sharp tailoring. Italian craftsmanship meets modern design. Features notch lapels and a two-button closure.",
      stockAvailable: 20,
      trending: true,
      colors: [
        {
          color: "Navy Blue",
          imageUrl:
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2536&auto=format&fit=crop",
          sizes: [
            { size: "S", stock: 5, price: 8950, originalPrice: 12000 },
            { size: "M", stock: 5, price: 8950, originalPrice: 12000 },
            { size: "L", stock: 5, price: 8950, originalPrice: 12000 },
            { size: "XL", stock: 5, price: 8950, originalPrice: 12000 },
          ],
        },
      ],
    },
    {
      name: "Leather Crossbody Bag",
      categoryId: accessories.id,
      brandId: ysl.id,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
      shortDescription: "Premium leather crossbody bag with gold hardware",
      longDescription:
        "Luxurious leather crossbody bag featuring signature YSL logo and adjustable strap. Perfect for day or evening wear.",
      stockAvailable: 10,
      trending: false,
      colors: [
        {
          color: "Black",
          imageUrl:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
          sizes: [{ size: "One Size", stock: 5, price: 21000 }],
        },
        {
          color: "Burgundy",
          imageUrl:
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
          sizes: [{ size: "One Size", stock: 5, price: 21000 }],
        },
      ],
    },
    {
      name: "Designer Sunglasses",
      categoryId: accessories.id,
      brandId: prada.id,
      imageUrl:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2680&auto=format&fit=crop",
      shortDescription: "Iconic cat-eye sunglasses with UV protection",
      longDescription:
        "Statement sunglasses with acetate frames and 100% UV protection. Comes with branded case and cleaning cloth.",
      stockAvailable: 25,
      trending: true,
      colors: [
        {
          color: "Black",
          imageUrl:
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2680&auto=format&fit=crop",
          sizes: [
            { size: "One Size", stock: 10, price: 3500, originalPrice: 5000 },
          ],
        },
        {
          color: "Tortoise",
          imageUrl:
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2680&auto=format&fit=crop",
          sizes: [
            { size: "One Size", stock: 8, price: 3500, originalPrice: 5000 },
          ],
        },
        {
          color: "Pink",
          imageUrl:
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2680&auto=format&fit=crop",
          sizes: [
            { size: "One Size", stock: 7, price: 3500, originalPrice: 5000 },
          ],
        },
      ],
    },
    {
      name: "Cashmere Sweater",
      categoryId: clothing.id,
      brandId: gucci.id,
      imageUrl:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2664&auto=format&fit=crop",
      shortDescription: "Ultra-soft cashmere crew neck sweater",
      longDescription:
        "100% pure cashmere sweater with ribbed trim. Lightweight yet warm, perfect for layering or wearing alone.",
      stockAvailable: 18,
      trending: false,
      colors: [
        {
          color: "Cream",
          imageUrl:
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2664&auto=format&fit=crop",
          sizes: [
            { size: "XS", stock: 3, price: 6800 },
            { size: "S", stock: 4, price: 6800 },
            { size: "M", stock: 4, price: 6800 },
            { size: "L", stock: 4, price: 6800 },
            { size: "XL", stock: 3, price: 6800 },
          ],
        },
      ],
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const { colors, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: {
        ...productInfo,
        colors: {
          create: colors.map((colorData) => ({
            color: colorData.color,
            imageUrl: colorData.imageUrl,
            sizes: {
              create: colorData.sizes.map((s) => ({
                size: s.size,
                stock: Number(s.stock),
                price: Number(s.price),
                originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
              })),
            },
          })),
        },
      },
    });

    createdProducts.push(product);
    console.log(`✓ Created product: ${product.name}`);
  }

  // Create Banners
  const banners = [
    {
      title: "Summer Collection 2024",
      imageUrl:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      link: "/shop",
      isActive: true,
      order: 1,
    },
    {
      title: "Exclusive Designer Sale",
      imageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      link: "/shop",
      isActive: true,
      order: 2,
    },
  ];

  for (const bannerData of banners) {
    const banner = await prisma.banner.create({
      data: bannerData,
    });
    console.log(`✓ Created banner: ${banner.title}`);
  }

  // Create Collections
  const collection1 = await prisma.collection.create({
    data: {
      name: "Trending Products",
      type: "Product",
      buttonName: "View All",
      buttonLink: "/shop?sort=popularity",
      order: 1,
      products: {
        connect: createdProducts.slice(0, 3).map((p) => ({ id: p.id })),
      },
    },
  });

  const collection2 = await prisma.collection.create({
    data: {
      name: "Shop by Category",
      type: "Category",
      buttonName: "View Categories",
      buttonLink: "/categories",
      order: 2,
      categories: {
        connect: [{ id: clothing.id }, { id: accessories.id }],
      },
    },
  });

  const collection3 = await prisma.collection.create({
    data: {
      name: "Premium Brands",
      type: "Brand",
      buttonName: "Explore Brands",
      buttonLink: "/shop",
      order: 3,
      brands: {
        connect: [
          { id: gucci.id },
          { id: armani.id },
          { id: ysl.id },
          { id: prada.id },
        ],
      },
    },
  });

  console.log("✓ Collections created");

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
