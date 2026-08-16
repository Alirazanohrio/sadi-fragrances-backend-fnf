const ShippingSettings = require("../models/ShippingSettings");

const getShippingSettings = async (req, res, next) => {
  try {
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = await ShippingSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateShippingSettings = async (req, res, next) => {
  try {
    const { enableFreeShipping, freeShippingAbove } = req.body;
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = await ShippingSettings.create({
        enableFreeShipping: !!enableFreeShipping,
        freeShippingAbove: Math.max(0, Number(freeShippingAbove) || 0),
      });
    } else {
      if (enableFreeShipping !== undefined) {
        settings.enableFreeShipping = enableFreeShipping === true || enableFreeShipping === "true";
      }
      if (freeShippingAbove !== undefined) {
        settings.freeShippingAbove = Math.max(0, Number(freeShippingAbove) || 0);
      }
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShippingSettings,
  updateShippingSettings,
};
