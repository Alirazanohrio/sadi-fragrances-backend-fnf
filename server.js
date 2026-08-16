require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const seedProducts = require("./utils/seedProducts");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to DB
  await connectDB();

  // Run initial seed tasks
  await seedAdmin();
  await seedProducts();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
