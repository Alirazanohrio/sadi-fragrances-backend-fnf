const express = require("express");
const cors = require("cors");
const path = require("path");
require("./utils/init"); // setup uploads folder

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const contactRoutes = require("./routes/contacts");
const reviewRoutes = require("./routes/reviews");
const testBoxRoutes = require("./routes/testBoxes");
const shippingSettingsRoutes = require("./routes/shippingSettings");
const sliderRoutes = require("./routes/sliders");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads as fallback if not using external storage immediately or for validation
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Router mounting
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/test-boxes", testBoxRoutes);
app.use("/api/shipping-settings", shippingSettingsRoutes);
app.use("/api/sliders", sliderRoutes);

// Root index status
app.get("/", (req, res) => {
  res.json({ message: "Sadi Fragrances API is online." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

module.exports = app;
