const router = require("express").Router();
const user = require("../controllers/profileController");
const auth = require("../middleware/auth");

router.get("/profile", auth, user.getProfile);
router.put("/profile", auth, user.updateProfile);

module.exports = router;
