const express = require("express");
const {
  getShippingSettings,
  updateShippingSettings,
} = require("../controllers/shippingSettingsController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", getShippingSettings);
router.put("/", authMiddleware, adminOnly, updateShippingSettings);

module.exports = router;
