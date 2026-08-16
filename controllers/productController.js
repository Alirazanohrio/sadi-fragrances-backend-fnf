const Product = require("../models/Product");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinaryService");

const getProducts = async (req, res, next) => {
  try {
    const { category, gender, featured, bestSeller, newArrival } = req.query;
    const query = {};

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (featured) query.featured = featured === "true";
    if (bestSeller) query.bestSeller = bestSeller === "true";
    if (newArrival) query.newArrival = newArrival === "true";

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      category,
      gender,
      description,
      fragranceNotes,
      price,
      oldPrice,
      stock,
      rating,
      featured,
      bestSeller,
      newArrival,
      concentration,
      size,
      shippingFee,
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }
    }

    const notesArray = Array.isArray(fragranceNotes)
      ? fragranceNotes
      : fragranceNotes
      ? fragranceNotes.split(",").map((n) => n.trim())
      : [];

    const finalPrice = Number(price || 0);
    const finalOldPrice = Number(oldPrice || 0);
    const calculatedDiscount = finalOldPrice > finalPrice ? (finalOldPrice - finalPrice) : 0;

    const product = await Product.create({
      name,
      brand,
      category,
      gender,
      description,
      fragranceNotes: notesArray,
      price: finalPrice,
      oldPrice: finalOldPrice,
      discount: calculatedDiscount,
      stock: Number(stock || 0),
      rating: Number(rating || 5),
      images: imageUrls,
      featured: featured === "true" || featured === true,
      bestSeller: bestSeller === "true" || bestSeller === true,
      newArrival: newArrival === "true" || newArrival === true,
      concentration,
      size,
      shippingFee: Math.max(0, Number(shippingFee || 0)),
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Recalculate discount dynamically
    const newPrice = updateData.price !== undefined ? Number(updateData.price) : product.price;
    const newOldPrice = updateData.oldPrice !== undefined ? Number(updateData.oldPrice) : product.oldPrice;
    updateData.discount = newOldPrice > newPrice ? (newOldPrice - newPrice) : 0;
    updateData.price = newPrice;
    updateData.oldPrice = newOldPrice;

    // Parse list inputs
    if (updateData.fragranceNotes) {
      updateData.fragranceNotes = Array.isArray(updateData.fragranceNotes)
        ? updateData.fragranceNotes
        : updateData.fragranceNotes.split(",").map((n) => n.trim());
    }

    // Convert booleans
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true" || updateData.featured === true;
    if (updateData.bestSeller !== undefined) updateData.bestSeller = updateData.bestSeller === "true" || updateData.bestSeller === true;
    if (updateData.newArrival !== undefined) updateData.newArrival = updateData.newArrival === "true" || updateData.newArrival === true;

    // Convert shippingFee
    if (updateData.shippingFee !== undefined) {
      updateData.shippingFee = Math.max(0, Number(updateData.shippingFee) || 0);
    }

    // Handle Image upload additions
    if (req.files && req.files.length > 0) {
      const newUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        newUrls.push(url);
      }
      // If we replace fully or append:
      if (req.body.replaceImages === "true") {
        // Delete old Cloudinary files
        for (const imgUrl of product.images) {
          await deleteFromCloudinary(imgUrl);
        }
        updateData.images = newUrls;
      } else {
        updateData.images = [...product.images, ...newUrls];
      }
    } else if (req.body.imagesList) {
      // Re-ordering or selective removal via JSON string array list
      try {
        updateData.images = JSON.parse(req.body.imagesList);
      } catch (e) {}
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Remove from Cloudinary
    for (const imgUrl of product.images) {
      await deleteFromCloudinary(imgUrl);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const markInStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // If a stock value is provided, use it; otherwise set to default 10
    product.stock = Number(stock !== undefined ? stock : 10);
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const markOutOfStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    product.stock = 0;
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const removeSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    // Remove sale by clearing oldPrice and discount
    product.oldPrice = 0;
    product.discount = 0;
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  markInStock,
  markOutOfStock,
  removeSale,
};
