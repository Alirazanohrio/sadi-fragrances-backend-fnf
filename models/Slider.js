const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    buttonText: {
      type: String,
      default: "Shop Now",
    },
    buttonLink: {
      type: String,
      default: "/products",
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", sliderSchema);
