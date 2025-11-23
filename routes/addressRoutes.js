const router = require("express").Router();
const address = require("../controllers/addressController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, address.createAddress);
router.put("/:id", auth, address.updateAddresses);
router.delete("/:id", auth, address.deleteAddress);
router.get("/", auth, address.getUserAddresses);
router.put("/default/:id", auth, address.setDefaultAddress);

module.exports = router;
