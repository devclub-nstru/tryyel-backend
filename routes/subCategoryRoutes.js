const router = require("express").Router();
const sub = require("../controllers/subCategoryController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, sub.addSubCategory);
router.get("/", sub.getAllSubCategories);
router.put("/:id", auth, sub.updateSubCategory);
router.delete("/:id", auth, sub.deleteSubCategory);

module.exports = router;
