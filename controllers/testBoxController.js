const TestBox = require("../models/TestBox");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinaryService");

const getTestBoxes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const testBoxes = await TestBox.find(query).sort({ createdAt: -1 });
    res.json(testBoxes);
  } catch (error) {
    next(error);
  }
};

const getTestBoxByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let testBox = null;
    
    // Check if valid ObjectId first, then fallback to slug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      testBox = await TestBox.findById(idOrSlug);
    }
    
    if (!testBox) {
      testBox = await TestBox.findOne({ slug: idOrSlug });
    }

    if (!testBox) {
      return res.status(404).json({ message: "Test Box not found." });
    }
    res.json(testBox);
  } catch (error) {
    next(error);
  }
};

const createTestBox = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      price,
      oldPrice,
      shortDescription,
      fullDescription,
      features,
      whatsIncluded,
      stock,
      status,
      shippingFee,
    } = req.body;

    if (!name || !slug || !price || !shortDescription || !fullDescription) {
      return res.status(400).json({ message: "Required fields: Name, Slug, Price, Short Description, Full Description." });
    }

    // Check slug uniqueness
    const existing = await TestBox.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Slug must be unique. A test box with this slug already exists." });
    }

    let mainImageUrl = "";
    if (req.file) {
      mainImageUrl = await uploadToCloudinary(req.file.path);
    } else if (req.body.mainImage) {
      mainImageUrl = req.body.mainImage;
    }

    if (!mainImageUrl) {
      return res.status(400).json({ message: "Main image is required." });
    }

    const featuresArray = Array.isArray(features)
      ? features
      : features
      ? features.split(",").map((f) => f.trim())
      : [];

    const whatsIncludedArray = Array.isArray(whatsIncluded)
      ? whatsIncluded
      : whatsIncluded
      ? whatsIncluded.split(",").map((w) => w.trim())
      : [];

    const finalPrice = Number(price || 0);
    const finalOldPrice = Number(oldPrice || 0);
    const calculatedDiscount = finalOldPrice > finalPrice ? (finalOldPrice - finalPrice) : 0;

    const testBox = await TestBox.create({
      name,
      slug,
      mainImage: mainImageUrl,
      price: finalPrice,
      oldPrice: finalOldPrice,
      discount: calculatedDiscount,
      shortDescription,
      fullDescription,
      features: featuresArray,
      whatsIncluded: whatsIncludedArray,
      stock: Number(stock !== undefined ? stock : 10),
      status: status || "Active",
      rating: 5,
      reviewsCount: 0,
      shippingFee: Math.max(0, Number(shippingFee || 0)),
    });

    res.status(201).json(testBox);
  } catch (error) {
    next(error);
  }
};

const updateTestBox = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const testBox = await TestBox.findById(id);
    if (!testBox) {
      return res.status(404).json({ message: "Test Box not found." });
    }

    // Slug unique check if changing
    if (updateData.slug && updateData.slug !== testBox.slug) {
      const existing = await TestBox.findOne({ slug: updateData.slug });
      if (existing) {
        return res.status(400).json({ message: "Slug must be unique. Another test box uses this slug." });
      }
    }

    // Recalculate discount
    const newPrice = updateData.price !== undefined ? Number(updateData.price) : testBox.price;
    const newOldPrice = updateData.oldPrice !== undefined ? Number(updateData.oldPrice) : testBox.oldPrice;
    updateData.discount = newOldPrice > newPrice ? (newOldPrice - newPrice) : 0;
    updateData.price = newPrice;
    updateData.oldPrice = newOldPrice;

    // Convert shippingFee
    if (updateData.shippingFee !== undefined) {
      updateData.shippingFee = Math.max(0, Number(updateData.shippingFee) || 0);
    }

    // Parse array fields
    if (updateData.features !== undefined) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features
        : updateData.features
        ? updateData.features.split(",").map((f) => f.trim())
        : [];
    }
    if (updateData.whatsIncluded !== undefined) {
      updateData.whatsIncluded = Array.isArray(updateData.whatsIncluded)
        ? updateData.whatsIncluded
        : updateData.whatsIncluded
        ? updateData.whatsIncluded.split(",").map((w) => w.trim())
        : [];
    }

    // Handle single image file upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (testBox.mainImage) {
        await deleteFromCloudinary(testBox.mainImage);
      }
      const newUrl = await uploadToCloudinary(req.file.path);
      updateData.mainImage = newUrl;
    }

    const updated = await TestBox.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteTestBox = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testBox = await TestBox.findById(id);
    if (!testBox) {
      return res.status(404).json({ message: "Test Box not found." });
    }

    // Remove image from Cloudinary
    if (testBox.mainImage) {
      await deleteFromCloudinary(testBox.mainImage);
    }

    await TestBox.findByIdAndDelete(id);
    res.json({ message: "Test Box deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestBoxes,
  getTestBoxByIdOrSlug,
  createTestBox,
  updateTestBox,
  deleteTestBox,
};
