const router = require("express").Router();
const address = require("../controllers/addressController");
const auth = require("../middleware/auth");

router.post("/", auth, address.addAddress);
router.put("/:id", auth, address.updateAddress);
router.delete("/:id", auth, address.deleteAddress);
router.get("/", auth, address.getAddresses);
router.put("/default/:id", auth, address.setDefaultAddress);

module.exports = router;
