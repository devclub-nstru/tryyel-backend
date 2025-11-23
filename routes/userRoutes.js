const router = require("express").Router();
const user = require("../controllers/profileController.js");
const auth = require("../middleware/auth.js");

router.get("/profile", auth, user.getProfile);
router.put("/profile", auth, user.updateProfile);

module.exports = router;
