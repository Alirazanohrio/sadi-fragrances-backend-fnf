const express = require("express");
const { addReview, addReviewForTestBox, getReviewsByProduct, getReviewsByTestBox, deleteReview, getAllReviews, getPublicReviews } = require("../controllers/reviewController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();


router.get("/product/:productId", getReviewsByProduct);
router.post("/product/:productId", addReview);
router.get("/test-box/:testBoxId", getReviewsByTestBox);
router.post("/test-box/:testBoxId", addReviewForTestBox);
router.get("/public", getPublicReviews);


router.get("/", authMiddleware, adminOnly, getAllReviews);
router.delete("/:id", authMiddleware, adminOnly, deleteReview);

module.exports = router;
