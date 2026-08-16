const Slider = require("../models/Slider");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinaryService");

const normalizeImageList = (images, fallback = []) => {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string") {
    return images ? [images] : [];
  }

  return fallback;
};

const getSlides = async (req, res, next) => {
  try {
    const slides = await Slider.find().sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (error) {
    next(error);
  }
};

const createSlide = async (req, res, next) => {
  try {
    const { title, subtitle, buttonText, buttonLink, active, order } = req.body;

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        uploadedImages.push(url);
      }
    }

    const existingImages = normalizeImageList(req.body.images || req.body.image, uploadedImages);
    const finalImages = uploadedImages.length > 0 ? uploadedImages : existingImages;

    if (!finalImages.length) {
      return res.status(400).json({ message: "At least one slider image is required." });
    }

    const slide = await Slider.create({
      title: title || "",
      subtitle: subtitle || "",
      image: finalImages[0],
      images: finalImages,
      buttonText: buttonText || "Shop Now",
      buttonLink: buttonLink || "/products",
      active: active === undefined ? true : active === true || active === "true",
      order: Number(order || 0),
    });

    res.status(201).json(slide);
  } catch (error) {
    next(error);
  }
};

const updateSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await Slider.findById(id);

    if (!slide) {
      return res.status(404).json({ message: "Slider not found." });
    }

    const updateData = { ...req.body };
    const incomingImages = normalizeImageList(req.body.images || req.body.image, []);

    if (req.files && req.files.length > 0) {
      const newUploadedUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        newUploadedUrls.push(url);
      }

      if (req.body.replaceImages === "true" || req.body.replaceImages === true) {
        for (const oldUrl of slide.images || [slide.image]) {
          if (oldUrl) await deleteFromCloudinary(oldUrl);
        }
        updateData.images = newUploadedUrls;
        updateData.image = newUploadedUrls[0] || "";
      } else {
        const merged = [...normalizeImageList(slide.images), ...newUploadedUrls];
        updateData.images = merged;
        updateData.image = merged[0] || slide.image || "";
      }
    } else if (incomingImages.length > 0) {
      const images = [...normalizeImageList(slide.images), ...incomingImages];
      updateData.images = images;
      updateData.image = images[0];
    }

    if (updateData.active !== undefined) {
      updateData.active = updateData.active === true || updateData.active === "true";
    }

    if (updateData.order !== undefined) {
      updateData.order = Number(updateData.order);
    }

    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }

    const updatedSlide = await Slider.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedSlide);
  } catch (error) {
    next(error);
  }
};

const deleteSlide = async (req, res, next) => {
  try {
    const slide = await Slider.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Slider not found." });
    }

    const slideImages = [...normalizeImageList(slide.images), ...normalizeImageList(slide.image)];
    for (const imageUrl of slideImages) {
      if (imageUrl) await deleteFromCloudinary(imageUrl);
    }

    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: "Slider deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
};
