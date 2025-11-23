const router = require("express").Router();
const cat = require("../controllers/categoryController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, cat.createCategory);
router.get("/", cat.getAllCategories);
router.put("/:id", auth, cat.updateCategory);
router.delete("/:id", auth, cat.deleteCategory);

module.exports = router;
