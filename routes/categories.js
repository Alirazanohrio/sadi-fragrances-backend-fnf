const express = require("express");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", getCategories);
router.post("/", authMiddleware, adminOnly, createCategory);
router.put("/:id", authMiddleware, adminOnly, updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

module.exports = router;
