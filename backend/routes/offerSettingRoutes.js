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
    const { title, subtitle, endDate, isEnabled, badgeText, promoCode, discountPercentage, products } = req.body;

    let settings = await getOrCreateSettings();

    if (title !== undefined) settings.title = title.trim();
    if (subtitle !== undefined) settings.subtitle = subtitle.trim();
    if (endDate !== undefined) settings.endDate = new Date(endDate);
    if (typeof isEnabled === "boolean") settings.isEnabled = isEnabled;
    if (badgeText !== undefined) settings.badgeText = badgeText.trim();
    if (promoCode !== undefined) settings.promoCode = promoCode.trim().toUpperCase();
    if (discountPercentage !== undefined) settings.discountPercentage = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
    if (Array.isArray(products)) {
      settings.products = products.filter(Boolean);
    }

    await settings.save();

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// @route POST /api/offer-settings/validate-promo (Public)
router.post("/validate-promo", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ valid: false, message: "يرجى إدخال كود الخصم" });
    }

    const settings = await getOrCreateSettings();

    if (!settings.isEnabled) {
      return res.status(400).json({ valid: false, message: "عروض الخصم غير مفعلة حالياً" });
    }

    if (settings.endDate && new Date() > new Date(settings.endDate)) {
      return res.status(400).json({ valid: false, message: "انتهت فترة صلاحية هذا الخصم" });
    }

    if (!settings.promoCode || settings.promoCode.trim().toUpperCase() !== code.trim().toUpperCase()) {
      return res.status(400).json({ valid: false, message: "كود الخصم المدخل غير صحيح" });
    }

    const discountPercentage = settings.discountPercentage || 0;

    res.json({
      valid: true,
      promoCode: settings.promoCode,
      discountPercentage,
      message: discountPercentage > 0 ? `تم تطبيق خصم ${discountPercentage}% بنجاح 🎉` : "كود الخصم صالح ✓",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
