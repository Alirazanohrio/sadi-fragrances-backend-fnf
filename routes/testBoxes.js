const express = require("express");
const { getTestBoxes, getTestBoxByIdOrSlug, createTestBox, updateTestBox, deleteTestBox } = require("../controllers/testBoxController");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getTestBoxes);
router.get("/:idOrSlug", getTestBoxByIdOrSlug);
router.post("/", authMiddleware, adminOnly, upload.single("mainImage"), createTestBox);
router.put("/:id", authMiddleware, adminOnly, upload.single("mainImage"), updateTestBox);
router.delete("/:id", authMiddleware, adminOnly, deleteTestBox);

module.exports = router;
