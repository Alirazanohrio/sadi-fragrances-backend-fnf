const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const TestBox = require("../models/TestBox");

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, customerInfo, subtotal, shippingFee, grandTotal, paymentMethod } = req.body;
    if (!items || items.length === 0 || !customerInfo) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid order details." });
    }

    // Validate stock for each item and decrement
    for (const it of items) {
      const Model = it.productType === "TestBox" ? TestBox : Product;
      const product = await Model.findById(it.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product not found: ${it.product}` });
      }
      const qty = Number(it.quantity || 0);
      if (product.stock < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${product.name || product._id}` });
      }
      product.stock = product.stock - qty;
      await product.save({ session });
    }

    // Auto-generate a clean, unique order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SADI-${timestamp}-${random}`;

    const order = new Order({
      orderNumber,
      items,
      customerInfo,
      subtotal,
      shippingFee,
      grandTotal,
      paymentMethod: paymentMethod || "COD",
      status: "Pending",
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (status) order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json({ message: "Order deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};

