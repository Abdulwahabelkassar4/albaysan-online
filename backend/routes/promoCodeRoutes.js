import express from "express";
import { PromoCode } from "../models/PromoCode.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route GET /api/promo-codes (Admin Protected)
router.get("/", authMiddleware, async (_req, res, next) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promoCodes);
  } catch (error) {
    next(error);
  }
});

// @route POST /api/promo-codes (Admin Protected)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      isEnabled,
      scope,
      applicableCategories,
      applicableProducts,
      usageLimit,
    } = req.body;

    if (!code || !discountValue || !endDate) {
      return res.status(400).json({ message: "يرجى كتابة رمز الكود وقيمة الخصم وتاريخ الانتهاء" });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: "رمز كود الخصم موجود بالفعل، يرجى اختيار رمز آخر" });
    }

    const promo = await PromoCode.create({
      code: cleanCode,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
      scope: scope || "global",
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    res.status(201).json(promo);
  } catch (error) {
    next(error);
  }
});

// @route PUT /api/promo-codes/:id (Admin Protected)
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      startDate,
      endDate,
      isEnabled,
      scope,
      applicableCategories,
      applicableProducts,
      usageLimit,
    } = req.body;

    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: "كود الخصم غير موجود" });
    }

    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== promo.code) {
        const existing = await PromoCode.findOne({ code: cleanCode });
        if (existing) {
          return res.status(400).json({ message: "رمز كود الخصم موجود بالفعل" });
        }
        promo.code = cleanCode;
      }
    }

    if (discountType !== undefined) promo.discountType = discountType;
    if (discountValue !== undefined) promo.discountValue = Number(discountValue);
    if (startDate !== undefined) promo.startDate = new Date(startDate);
    if (endDate !== undefined) promo.endDate = new Date(endDate);
    if (typeof isEnabled === "boolean") promo.isEnabled = isEnabled;
    if (scope !== undefined) promo.scope = scope;
    if (Array.isArray(applicableCategories)) promo.applicableCategories = applicableCategories;
    if (Array.isArray(applicableProducts)) promo.applicableProducts = applicableProducts;
    if (usageLimit !== undefined) promo.usageLimit = usageLimit ? Number(usageLimit) : null;

    await promo.save();
    res.json(promo);
  } catch (error) {
    next(error);
  }
});

// @route DELETE /api/promo-codes/:id (Admin Protected)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: "كود الخصم غير موجود" });
    }
    res.json({ message: "تم حذف كود الخصم بنجاح" });
  } catch (error) {
    next(error);
  }
});

// @route POST /api/promo-codes/validate (Public)
router.post("/validate", async (req, res, next) => {
  try {
    const { code, cartItems = [], subtotal = 0 } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ valid: false, message: "يرجى كتابة كود الخصم" });
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await PromoCode.findOne({ code: cleanCode });

    if (!promo || !promo.isEnabled) {
      return res.status(400).json({ valid: false, message: "كود الخصم المدخل غير صحيح أو غير مفعل" });
    }

    const now = new Date();
    if (promo.startDate && now < new Date(promo.startDate)) {
      return res.status(400).json({ valid: false, message: "لم تبدأ فترة صلاحية كود الخصم بعد" });
    }

    if (promo.endDate && now > new Date(promo.endDate)) {
      return res.status(400).json({ valid: false, message: "انتهت فترة صلاحية كود الخصم" });
    }

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({ valid: false, message: "وصل هذا الكود إلى الحد الأقصى للاستخدام" });
    }

    // Calculate eligible subtotal based on scope
    let eligibleSubtotal = Number(subtotal) || 0;

    if (promo.scope === "categories" && Array.isArray(promo.applicableCategories) && promo.applicableCategories.length > 0) {
      const allowedCategories = new Set(promo.applicableCategories);
      eligibleSubtotal = (cartItems || []).reduce((sum, item) => {
        if (item.category && allowedCategories.has(item.category)) {
          return sum + (Number(item.price) || 0) * (Number(item.qty) || 1);
        }
        return sum;
      }, 0);

      if (eligibleSubtotal <= 0) {
        return res.status(400).json({
          valid: false,
          message: "هذا الخصم مخصص لأقسام معينة، وسلتك لا تحتوي على منتجات من هذه الأقسام",
        });
      }
    } else if (promo.scope === "products" && Array.isArray(promo.applicableProducts) && promo.applicableProducts.length > 0) {
      const allowedProductIds = new Set(promo.applicableProducts.map((p) => p.toString()));
      eligibleSubtotal = (cartItems || []).reduce((sum, item) => {
        const itemId = (item.id || item._id || item.productId)?.toString();
        if (itemId && allowedProductIds.has(itemId)) {
          return sum + (Number(item.price) || 0) * (Number(item.qty) || 1);
        }
        return sum;
      }, 0);

      if (eligibleSubtotal <= 0) {
        return res.status(400).json({
          valid: false,
          message: "هذا الخصم مخصص لمنتجات محددة، وسلتك لا تحتوي على أي منها",
        });
      }
    }

    // Compute discount amount
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = (eligibleSubtotal * (promo.discountValue || 0)) / 100;
    } else {
      discountAmount = Math.min(eligibleSubtotal, promo.discountValue || 0);
    }

    res.json({
      valid: true,
      promoCode: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      scope: promo.scope,
      message:
        promo.discountType === "percentage"
          ? `تم تطبيق خصم ${promo.discountValue}% بنجاح 🎉`
          : `تم تطبيق خصم بقيمة ${promo.discountValue} د.أ بنجاح 🎉`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
