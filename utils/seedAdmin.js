const bcrypt = require("bcrypt");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || "";

    if (!adminUsername || !adminPassword) {
      console.warn("Skipping Admin Seeding: ADMIN_USERNAME and ADMIN_PASSWORD must be configured in environment variables.");
      return;
    }

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin user already configured in Database.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin seeded successfully using environment variables.");
  } catch (error) {
    console.error("Failed seeding admin account", error);
  }
};

module.exports = seedAdmin;
