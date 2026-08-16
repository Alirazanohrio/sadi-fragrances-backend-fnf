const mongoose = require("mongoose");

const shippingSettingsSchema = new mongoose.Schema(
  {
    enableFreeShipping: {
      type: Boolean,
      default: false,
    },
    freeShippingAbove: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingSettings", shippingSettingsSchema);
