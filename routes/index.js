const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
// router.use("/user", require("./userRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/subcategories", require("./subCategoryRoutes"));
// router.use("/brands", require("./brandRoutes"));
router.use("/collections", require("./collectionRoutes"));
router.use("/cart", require("./cartRoutes"));
// router.use("/wishlist", require("./wishlistRoutes"));
router.use("/address", require("./addressRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/home", require("./homeRoutes"));

module.exports = router;
