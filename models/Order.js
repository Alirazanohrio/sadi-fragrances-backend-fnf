const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "items.productType",
          required: true,
        },
        productType: {
          type: String,
          required: true,
          enum: ["Product", "TestBox"],
          default: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      whatsApp: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "Pakistan" },
      orderNotes: { type: String, default: "" },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

