const router = require("express").Router();
const review = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.post("/", auth, review.addReview);
router.put("/:id", auth, review.updateReview);
router.delete("/:id", auth, review.deleteReview);
router.get("/:productId", review.getProductReviews);

module.exports = router;
