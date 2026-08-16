const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecretjwtkey123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (username !== undefined) {
      const existing = await User.findOne({ username, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: "Username already taken." });
      }
      user.username = username;
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }
      user.email = email;
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecretjwtkey123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Profile updated successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    // Always send admin reset link to configured ADMIN_EMAIL or fallback to sadifragrances@gmail.com
    const adminEmail = process.env.ADMIN_EMAIL || "sadifragrances@gmail.com";

    const user = await User.findOne({ role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/admin/reset-password/${resetToken}`;

    let info;
    try {
      info = await sendPasswordResetEmail(adminEmail, resetUrl);
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      console.error("[authController] sendPasswordResetEmail error:", emailError);
      return res.status(500).json({ message: "Failed to send reset email. Check SMTP configuration." });
    }

    // In development, return the resetUrl and any preview link to help with testing.
    if (process.env.NODE_ENV !== "production") {
      // nodemailer preview URL is logged in emailService; also include resetUrl in response for convenience
      return res.json({ message: `Password reset link sent to ${adminEmail}.`, resetUrl, preview: info && info.messageId ? `nodemailer: ${info.messageId}` : undefined });
    }

    res.json({ message: `Password reset link sent to ${adminEmail}.` });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful. Redirecting to login..." });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, changePassword, updateProfile, forgotPassword, resetPassword };
