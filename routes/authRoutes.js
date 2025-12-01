const router = require("express").Router();
const auth = require("../controllers/authController.js");

router.get("/me", auth.getMe);
router.post("/check-user", auth.checkUser);
router.post("/logout", auth.logout);

module.exports = router;
