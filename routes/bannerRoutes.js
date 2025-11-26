const express = require("express");
const { getBanners } = require("../controllers/bannerController");

const router = express.Router();

// Public route - no auth required
router.get("/", getBanners);

module.exports = router;
