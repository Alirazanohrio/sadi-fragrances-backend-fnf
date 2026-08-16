const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

const uploadBufferToCloudinary = (buffer, originalName = "image") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sadi-fragrances",
        resource_type: "image",
        public_id: path.basename(originalName, path.extname(originalName)),
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });

const uploadToCloudinary = async (fileOrPath) => {
  if (!hasCloudinaryConfig()) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel Environment Variables."
    );
  }

  try {
    if (fileOrPath && Buffer.isBuffer(fileOrPath.buffer)) {
      return await uploadBufferToCloudinary(
        fileOrPath.buffer,
        fileOrPath.originalname || "image"
      );
    }

    if (typeof fileOrPath === "string") {
      const result = await cloudinary.uploader.upload(fileOrPath, {
        folder: "sadi-fragrances",
      });
      try {
        if (fs.existsSync(fileOrPath)) fs.unlinkSync(fileOrPath);
      } catch (_) {}
      return result.secure_url;
    }

    throw new Error("No valid uploaded file was provided.");
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw error;
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || imageUrl.includes("/uploads/")) return;
    if (!hasCloudinaryConfig()) return;

    const url = new URL(imageUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return;

    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    const last = publicIdParts.pop();
    if (!last) return;

    const baseName = last.replace(/\.[^/.]+$/, "");
    publicIdParts.push(baseName);
    const publicId = publicIdParts.join("/");

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
