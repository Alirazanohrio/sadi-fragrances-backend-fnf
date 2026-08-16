const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "Sadi Fragrances",
    },
    category: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "Ittars collections", "our-collection", "bundles"],
      default: "unisex",
    },
    description: {
      type: String,
      required: true,
    },
    fragranceNotes: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    concentration: {
      type: String,
      default: "Eau de Parfum",
    },
    size: {
      type: String,
      default: "50ml",
    },
  },
  { timestamps: true }
);

// Virtual properties or calculations can be handled here or in controllers
module.exports = mongoose.model("Product", productSchema);
