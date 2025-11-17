import express from "express";
import { Product } from "../models/Product.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeImages = (images, fallbackImage) => {
  const normalized = Array.isArray(images)
    ? images.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean)
    : [];

  if (!normalized.length && typeof fallbackImage === "string" && fallbackImage.trim()) {
    return [fallbackImage];
  }

  return normalized;
};

const parseImagesInput = (images) => {
  if (Array.isArray(images)) {
    return images.filter((image) => typeof image === "string" && image.trim());
  }

  if (typeof images === "string") {
    return images
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
};

const formatProduct = (productDoc) => {
  if (!productDoc) return null;

  const product =
    typeof productDoc.toObject === "function" ? productDoc.toObject() : { ...productDoc };

  const normalizedImages = normalizeImages(product.images, product.image);

  const id = product._id?.toString?.() ?? product._id;

  return {
    id,
    _id: id,
    name: product.name,
    price: product.price,
    description: product.description ?? "",
    category: product.category ?? "",
    productCollection: product.productCollection ?? product.collection ?? "",
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    images: normalizedImages,
    inStock: typeof product.inStock === "boolean" ? product.inStock : true,
  };
};

router.get("/", async (req, res, next) => {
  try {
    const { category, productCollection, search, page = 1, limit = 12 } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (productCollection) {
      filters.$or = [
        { productCollection },
        { collection: productCollection },
      ];
    }
    if (search) filters.$text = { $search: search };

    const query = Product.find(filters).sort({ createdAt: -1 });
    const total = await Product.countDocuments(filters);
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;

    const products = await query.skip((currentPage - 1) * perPage).limit(perPage);

    res.json({
      data: products.map((product) => formatProduct(product)),
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
    res.json(formatProduct(product));
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      category,
      productCollection,
      sizes = [],
      colors = [],
      images = [],
      inStock,
    } = req.body;

    const product = new Product({
      name,
      price,
      description,
      category,
      productCollection,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      images: parseImagesInput(images),
    });

    if (typeof inStock === "boolean") {
      product.inStock = inStock;
    }

    await product.save();

    res.status(201).json(formatProduct(product));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      category,
      productCollection,
      sizes,
      colors,
      images,
      inStock,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (productCollection !== undefined) updateData.productCollection = productCollection;
    if (sizes !== undefined) updateData.sizes = Array.isArray(sizes) ? sizes : [];
    if (colors !== undefined) updateData.colors = Array.isArray(colors) ? colors : [];
    if (images !== undefined) updateData.images = parseImagesInput(images);
    if (typeof inStock === "boolean") updateData.inStock = inStock;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(formatProduct(product));
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
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
