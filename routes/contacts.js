const express = require("express");
const { createContactMessage, getContactMessages } = require("../controllers/contactController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/", createContactMessage);
router.get("/", authMiddleware, adminOnly, getContactMessages);

module.exports = router;
