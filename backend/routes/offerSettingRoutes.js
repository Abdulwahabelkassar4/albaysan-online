import express from "express";
import { OfferSetting } from "../models/OfferSetting.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to get or create single settings record
const getOrCreateSettings = async () => {
  let settings = await OfferSetting.findOne();
  if (!settings) {
    settings = await OfferSetting.create({});
  }
  return settings;
};

// @route GET /api/offer-settings (Public)
router.get("/", async (_req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// @route PUT /api/offer-settings (Admin Protected)
router.put("/", authMiddleware, async (req, res, next) => {
  try {
    const { title, subtitle, endDate, isEnabled, badgeText, promoCode, products } = req.body;

    let settings = await getOrCreateSettings();

    if (title !== undefined) settings.title = title.trim();
    if (subtitle !== undefined) settings.subtitle = subtitle.trim();
    if (endDate !== undefined) settings.endDate = new Date(endDate);
    if (typeof isEnabled === "boolean") settings.isEnabled = isEnabled;
    if (badgeText !== undefined) settings.badgeText = badgeText.trim();
    if (promoCode !== undefined) settings.promoCode = promoCode.trim().toUpperCase();
    if (Array.isArray(products)) {
      settings.products = products.filter(Boolean);
    }

    await settings.save();

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;
