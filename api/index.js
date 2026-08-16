const app = require("../app");
const connectDB = require("../config/db");
const seedAdmin = require("../utils/seedAdmin");

let initialized;

module.exports = async (req, res) => {
  try {
    if (!initialized) {
      initialized = (async () => {
        await connectDB();
        await seedAdmin();
      })();
    }
    await initialized;
    return app(req, res);
  } catch (error) {
    console.error("Vercel API initialization error:", error);
    return res.status(500).json({
      message: "Server initialization failed.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
