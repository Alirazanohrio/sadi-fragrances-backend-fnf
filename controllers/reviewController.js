const Review = require("../models/Review");
const Product = require("../models/Product");


const updateProductStats = async (productId) => {
  const reviews = await Review.find({ product: productId, productType: "Product" });
  const reviewsCount = reviews.length;
  
  let averageRating = 5;
  if (reviewsCount > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Number((totalRating / reviewsCount).toFixed(1));
  } else {
    averageRating = 5;
  }

  await Product.findByIdAndUpdate(productId, {
    rating: averageRating,
    reviewsCount: reviewsCount
  });
};

const updateTestBoxStats = async (testBoxId) => {
  const TestBox = require("../models/TestBox");
  const reviews = await Review.find({ product: testBoxId, productType: "TestBox" });
  const reviewsCount = reviews.length;
  
  let averageRating = 5;
  if (reviewsCount > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Number((totalRating / reviewsCount).toFixed(1));
  } else {
    averageRating = 5;
  }

  await TestBox.findByIdAndUpdate(testBoxId, {
    rating: averageRating,
    reviewsCount: reviewsCount
  });
};

const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { customerName, rating, message } = req.body;

    if (!customerName || !rating || !message) {
      return res.status(400).json({ message: "Customer name, rating (1-5) and message are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const review = await Review.create({
      product: productId,
      productType: "Product",
      customerName,
      rating: Number(rating),
      message
    });

    await updateProductStats(productId);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const addReviewForTestBox = async (req, res, next) => {
  try {
    const { testBoxId } = req.params;
    const { customerName, rating, message } = req.body;

    if (!customerName || !rating || !message) {
      return res.status(400).json({ message: "Customer name, rating (1-5) and message are required." });
    }

    const TestBox = require("../models/TestBox");
    const testBox = await TestBox.findById(testBoxId);
    if (!testBox) {
      return res.status(404).json({ message: "Test Box not found." });
    }

    const review = await Review.create({
      product: testBoxId,
      productType: "TestBox",
      customerName,
      rating: Number(rating),
      message
    });

    await updateTestBoxStats(testBoxId);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, productType: "Product" }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const getReviewsByTestBox = async (req, res, next) => {
  try {
    const { testBoxId } = req.params;
    const reviews = await Review.find({ product: testBoxId, productType: "TestBox" }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const productId = review.product;
    const productType = review.productType || "Product";

    await Review.findByIdAndDelete(id);

    if (productType === "TestBox") {
      await updateTestBoxStats(productId);
    } else {
      await updateProductStats(productId);
    }

    res.json({ message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate("product", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate("product", "name").sort({ createdAt: -1 }).limit(10);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  addReviewForTestBox,
  getReviewsByProduct,
  getReviewsByTestBox,
  deleteReview,
  getAllReviews,
  getPublicReviews
};
