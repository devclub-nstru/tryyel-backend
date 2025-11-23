const router = require("express").Router();
const review = require("../controllers/reviewController.js");
const auth = require("../middleware/auth.js");

router.post("/", auth, review.addReview);
router.put("/:id", auth, review.updateReview);
router.delete("/:id", auth, review.deleteReview);
router.get("/:productId", review.getProductReviews);

module.exports = router;
