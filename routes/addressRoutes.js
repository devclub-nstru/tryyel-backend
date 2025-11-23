const router = require("express").Router();
const address = require("../controllers/addressController");
const auth = require("../middleware/auth");

router.post("/", auth, address.createAddress);
router.put("/:id", auth, address.updateAddresses);
router.delete("/:id", auth, address.deleteAddress);
router.get("/", auth, address.getUserAddresses);
router.put("/default/:id", auth, address.setDefaultAddress);

module.exports = router;
