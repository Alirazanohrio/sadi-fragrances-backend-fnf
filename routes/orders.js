const express = require("express");
const { createOrder, getOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", createOrder);
router.get("/", authMiddleware, adminOnly, getOrders);
router.put("/:id", authMiddleware, adminOnly, updateOrderStatus);
router.delete("/:id", authMiddleware, adminOnly, deleteOrder);

module.exports = router;

