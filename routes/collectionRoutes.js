const router = require("express").Router();
const collection = require("../controllers/collectionController.js");

router.get("/", collection.getCollections);

module.exports = router;
