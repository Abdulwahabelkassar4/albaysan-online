import express from "express";
import { Category } from "../models/Category.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: "عباءات", type: "category" },
  { name: "ادناءات", type: "category" },
  { name: "نقابات", type: "category" },
  { name: "سبورات شرعية", type: "category" },
  { name: "حقائب", type: "category" },
];

const DEFAULT_COLLECTIONS = [
  { name: "الكوليكشن الصيفي", type: "collection" },
  { name: "الكوليكشن الخريفي", type: "collection" },
  { name: "الكوليكشن الشتوي", type: "collection" },
  { name: "الكوليكشن الربيعي", type: "collection" },
];

// Helper to seed defaults if db is empty
const seedDefaultsIfEmpty = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany([...DEFAULT_CATEGORIES, ...DEFAULT_COLLECTIONS]);
  }
};

router.get("/", async (req, res, next) => {
  try {
    await seedDefaultsIfEmpty();
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;

    const items = await Category.find(filter).sort({ createdAt: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get("/all", authMiddleware, async (req, res, next) => {
  try {
    await seedDefaultsIfEmpty();
    const items = await Category.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, type = "category" } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "اسم التصنيف مطلوب" });
    }

    const exists = await Category.findOne({ name: name.trim(), type });
    if (exists) {
      if (!exists.isActive) {
        exists.isActive = true;
        await exists.save();
        return res.json(exists);
      }
      return res.status(400).json({ message: "هذا التصنيف موجود بالفعل" });
    }

    const item = await Category.create({ name: name.trim(), type });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { name, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (typeof isActive === "boolean") update.isActive = isActive;

    const item = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) {
      return res.status(404).json({ message: "التصنيف غير موجود" });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const item = await Category.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "التصنيف غير موجود" });
    }
    res.json({ message: "تم حذف التصنيف بنجاح" });
  } catch (error) {
    next(error);
  }
});

export default router;
