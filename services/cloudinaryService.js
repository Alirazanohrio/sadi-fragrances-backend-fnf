const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const uploadToCloudinary = async (filePath) => {
  try {
    // If using dummy keys, skip Cloudinary and serve locally
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME.includes("dummy") ||
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY.includes("dummy")
    ) {
      console.log("Using local fallback for image upload (Cloudinary not configured).");
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "sadi fragrances",
    });
    // Remove local file
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to local file:", error.message);
    try {
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    } catch (err) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (imageUrl.includes("/uploads/")) {
      // Delete local file
      const filename = imageUrl.split("/uploads/")[1];
      const localPath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return;
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME.includes("dummy")
    ) {
      return;
    }

    // Extract public_id from secure URL
    const parts = imageUrl.split("/");
    const filenameWithExt = parts[parts.length - 1];
    const publicId = `sadi fragrances/${filenameWithExt.split(".")[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed", error);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
