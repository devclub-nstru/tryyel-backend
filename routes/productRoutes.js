const router = require("express").Router();
const product = require("../controllers/productController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, product.addProduct);
router.put("/:id", auth, product.updateProduct);
router.delete("/:id", auth, product.deleteProduct);

router.get("/", product.getAllProducts);
router.get("/:id", product.getSingleProduct);

module.exports = router;
