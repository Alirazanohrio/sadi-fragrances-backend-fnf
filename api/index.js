require("dotenv").config();

const app = require("../app");
const connectDB = require("../config/db");
const seedAdmin = require("../utils/seedAdmin");
const seedProducts = require("../utils/seedProducts");

let initialized = false;
let initializationPromise = null;

async function initialize() {
  if (initialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      await connectDB();
      // These are safe/idempotent checks and only run once per warm instance.
      await seedAdmin();
      await seedProducts();
      initialized = true;
    })();
  }

  await initializationPromise;
}

module.exports = async (req, res) => {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error("Serverless initialization failed:", error);
    return res.status(500).json({
      message: "Server initialization failed.",
      error: process.env.NODE_ENV === "production" ? error.message : error.stack,
    });
  }
};
