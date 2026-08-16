const express = require("express");
const { login, getMe, changePassword, updateProfile, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePassword);
router.put("/profile", authMiddleware, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
