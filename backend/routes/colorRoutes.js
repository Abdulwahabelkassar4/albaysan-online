import express from "express";
import { ColorGuide } from "../models/ColorGuide.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const DEFAULT_COLORS = [
  { name: "أسود ملكي", hexCode: "#121212", description: "أسود فاخر داكن جداً", imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop" },
  { name: "كحلي غامق", hexCode: "#0f172a", description: "أزرق كحلي داكن راقي", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop" },
  { name: "زيتي دارك", hexCode: "#2d3a27", description: "أخضر زيتي عميق", imageUrl: "https://images.unsplash.com/photo-1516762689617-e1cffffd478d?w=500&auto=format&fit=crop" },
  { name: "بيج خشيبي", hexCode: "#d4b896", description: "بيج دافئ وطبيعي", imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&auto=format&fit=crop" },
  { name: "رمادي موف", hexCode: "#706d7e", description: "رمادي بلمسة موف ناعمة", imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop" },
  { name: "عنابي ملكي", hexCode: "#5c1326", description: "عنابي ماروني ناصع", imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=500&auto=format&fit=crop" },
  { name: "أخضر فاتح", hexCode: "#94a3b8", description: "أخضر باستيل زاهي ومريح", imageUrl: "https://images.unsplash.com/photo-1500462895327-e33622957688?w=500&auto=format&fit=crop" }
];

const seedColorsIfEmpty = async () => {
  const count = await ColorGuide.countDocuments();
  if (count === 0) {
    await ColorGuide.insertMany(DEFAULT_COLORS);
  }
};

// GET /api/colors (Public)
router.get("/", async (req, res, next) => {
  try {
    await seedColorsIfEmpty();
    const colors = await ColorGuide.find().sort({ createdAt: -1 });
    res.json(colors);
  } catch (error) {
    next(error);
  }
});

// POST /api/colors (Admin)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, hexCode, imageUrl, description, inStock } = req.body;
    if (!name || !hexCode) {
      return res.status(400).json({ message: "اسم اللون وكود اللون مطلوبان" });
    }

    const exists = await ColorGuide.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "هذا اللون مسجل بالفعل في دليل الألوان" });
    }

    const color = await ColorGuide.create({
      name: name.trim(),
      hexCode: hexCode.trim(),
      imageUrl: imageUrl || "",
      description: description || "",
      inStock: inStock !== undefined ? inStock : true,
    });

    res.status(201).json(color);
  } catch (error) {
    next(error);
  }
});

// PUT /api/colors/:id (Admin)
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { name, hexCode, imageUrl, description, inStock } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (hexCode !== undefined) update.hexCode = hexCode.trim();
    if (imageUrl !== undefined) update.imageUrl = imageUrl;
    if (description !== undefined) update.description = description;
    if (typeof inStock === "boolean") update.inStock = inStock;

    const color = await ColorGuide.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!color) {
      return res.status(404).json({ message: "اللون غير موجود" });
    }
    res.json(color);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/colors/:id (Admin)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const color = await ColorGuide.findByIdAndDelete(req.params.id);
    if (!color) {
      return res.status(404).json({ message: "اللون غير موجود" });
    }
    res.json({ message: "تم حذف اللون بنجاح" });
  } catch (error) {
    next(error);
  }
});

export default router;
