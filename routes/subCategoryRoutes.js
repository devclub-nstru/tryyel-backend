const router = require("express").Router();
const sub = require("../controllers/subCategoryController");
const auth = require("../middleware/auth");

router.post("/", auth, sub.addSubCategory);
router.get("/", sub.getSubCategories);
router.put("/:id", auth, sub.updateSubCategory);
router.delete("/:id", auth, sub.deleteSubCategory);

module.exports = router;
