const fs = require("fs");
const path = require("path");

const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "sadi-fragrances-uploads")
  : path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
