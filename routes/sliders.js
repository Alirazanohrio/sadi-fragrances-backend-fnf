const express = require("express");
const { getSlides, createSlide, updateSlide, deleteSlide } = require("../controllers/sliderController");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getSlides);
router.post("/", authMiddleware, adminOnly, upload.array("images", 10), createSlide);
router.put("/:id", authMiddleware, adminOnly, upload.array("images", 10), updateSlide);
router.delete("/:id", authMiddleware, adminOnly, deleteSlide);

module.exports = router;
