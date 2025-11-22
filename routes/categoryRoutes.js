const router = require("express").Router();
const cat = require("../controllers/categoryController");
const auth = require("../middleware/auth");

router.post("/", auth, cat.addCategory);
router.get("/", cat.getCategories);
router.put("/:id", auth, cat.updateCategory);
router.delete("/:id", auth, cat.deleteCategory);

module.exports = router;
