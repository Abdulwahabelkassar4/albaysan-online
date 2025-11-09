import express from "express";
import { Product } from "../models/Product.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, collection, search, page = 1, limit = 12 } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (collection) filters.collection = collection;
    if (search) filters.$text = { $search: search };

    const query = Product.find(filters).sort({ createdAt: -1 });
    const total = await Product.countDocuments(filters);
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;

    const products = await query.skip((currentPage - 1) * perPage).limit(perPage);

    res.json({
      data: products,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json({ message: "تم حذف المنتج" });
  } catch (error) {
    next(error);
  }
});

export default router;

