const express = require("express");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, markInStock, markOutOfStock, removeSale } = require("../controllers/productController");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, adminOnly, upload.array("images", 10), createProduct);
router.put("/:id", authMiddleware, adminOnly, upload.array("images", 10), updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);
// Mark product as in-stock (optionally provide { stock: number })
router.patch("/:id/instock", authMiddleware, adminOnly, markInStock);
// Mark product as out-of-stock
router.patch("/:id/outofstock", authMiddleware, adminOnly, markOutOfStock);
// Remove sale (clear oldPrice and discount)
router.patch("/:id/removesale", authMiddleware, adminOnly, removeSale);

module.exports = router;
