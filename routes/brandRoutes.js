const router = require("express").Router();
const brand = require("../controllers/brandController");
const auth = require("../middleware/auth");

router.post("/", auth, brand.createBrand);
router.get("/", brand.getBrands);
router.put("/:id", auth, brand.updateBrand);
router.delete("/:id", auth, brand.deleteBrand);

module.exports = router;
