const Contact = require("../models/Contact");

const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      type: type || "contact",
    });

    res.status(201).json({
      message: "Message received successfully.",
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

const getContactMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
};
