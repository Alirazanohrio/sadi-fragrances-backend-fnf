const mongoose = require("mongoose");

const testBoxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mainImage: {
      type: String,
      required: true,
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
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    whatsIncluded: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestBox", testBoxSchema);
