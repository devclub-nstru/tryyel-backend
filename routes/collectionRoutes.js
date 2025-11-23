const router = require("express").Router();
const collection = require("../controllers/collectionsController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, collection.createCollection);
router.get("/", collection.getAllCollections);
router.get("/:id", collection.getCollectionById);
router.put("/:id", auth, collection.updateCollection);
router.delete("/:id", auth, collection.deleteCollection);

module.exports = router;
