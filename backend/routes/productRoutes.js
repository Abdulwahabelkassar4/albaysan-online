import express from "express";
import { Product } from "../models/Product.js";
import { OfferSetting } from "../models/OfferSetting.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const checkOfferSettings = async () => {
  try {
    const settings = await OfferSetting.findOne();
    if (!settings || !settings.isEnabled || !settings.endDate) {
      return { isOfferActive: false, offerProductIds: new Set() };
    }
    const isOfferActive = new Date() < new Date(settings.endDate);
    const offerProductIds = new Set(
      (settings.products || []).map((id) => id.toString())
    );
    return { isOfferActive, offerProductIds };
  } catch (error) {
    return { isOfferActive: false, offerProductIds: new Set() };
  }
};

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

const formatProduct = (productDoc, offerContext = { isOfferActive: false, offerProductIds: new Set() }, raw = false) => {
  if (!productDoc) return null;

  const product =
    typeof productDoc.toObject === "function" ? productDoc.toObject() : { ...productDoc };

  const normalizedImages = normalizeImages(product.images, product.image);

  const id = product._id?.toString?.() ?? product._id;
  const storedOriginalPrice = product.originalPrice !== undefined && product.originalPrice !== null ? Number(product.originalPrice) : null;
  const storedPrice = Number(product.price);

  const { isOfferActive = false, offerProductIds = new Set() } = offerContext;
  const isProductInOffer = isOfferActive && offerProductIds.has(id);

  // If raw mode (admin) OR product is in active offer campaign, keep stored discounted price & original price
  if (raw || isProductInOffer) {
    return {
      id,
      _id: id,
      name: product.name,
      price: storedPrice,
      originalPrice: storedOriginalPrice,
      discountTag: product.discountTag ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      productCollection: product.productCollection ?? product.collection ?? "",
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      images: normalizedImages,
      inStock: typeof product.inStock === "boolean" ? product.inStock : true,
      isInActiveOffer: isProductInOffer,
    };
  }

  // Offer is EXPIRED, DISABLED, or product NOT in active offer: Revert selling price to originalPrice automatically
  const effectivePrice = storedOriginalPrice && storedOriginalPrice > 0 ? storedOriginalPrice : storedPrice;

  return {
    id,
    _id: id,
    name: product.name,
    price: effectivePrice,
    originalPrice: null,
    discountTag: "",
    description: product.description ?? "",
    category: product.category ?? "",
    productCollection: product.productCollection ?? product.collection ?? "",
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    images: normalizedImages,
    inStock: typeof product.inStock === "boolean" ? product.inStock : true,
    isInActiveOffer: false,
  };
};

router.get("/", async (req, res, next) => {
  try {
    const { category, productCollection, search, offersOnly, page = 1, limit = 12, raw } = req.query;
    const isRaw = raw === "true" || raw === true;
    const offerContext = await checkOfferSettings();

    const filters = {};

    if (category) filters.category = category;
    if (productCollection) {
      filters.$or = [
        { productCollection },
        { collection: productCollection },
      ];
    }
    if (offersOnly === "true" || offersOnly === true) {
      if (!isRaw) {
        if (!offerContext.isOfferActive || offerContext.offerProductIds.size === 0) {
          return res.json({
            data: [],
            pagination: {
              total: 0,
              page: 1,
              pages: 0,
            },
          });
        }
        filters._id = { $in: Array.from(offerContext.offerProductIds) };
      } else {
        filters.originalPrice = { $gt: 0 };
      }
    }
    if (search) filters.$text = { $search: search };

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;

    const query = Product.find(filters).sort({ createdAt: -1 });
    const total = await Product.countDocuments(filters);

    const products = await query.skip((currentPage - 1) * perPage).limit(perPage);

    res.json({
      data: products.map((product) => formatProduct(product, offerContext, isRaw)),
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
    const isRaw = req.query.raw === "true" || req.query.raw === true;
    const offerContext = await checkOfferSettings();
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json(formatProduct(product, offerContext, isRaw));
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      name,
      price,
      originalPrice,
      discountTag,
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
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountTag: discountTag || "",
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
      originalPrice,
      discountTag,
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
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (discountTag !== undefined) updateData.discountTag = discountTag;
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

router.post("/bulk", authMiddleware, async (req, res, next) => {
  try {
    const { productIds, action, inStock } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "يرجى تحديد المنتجات" });
    }

    if (action === "delete") {
      await Product.deleteMany({ _id: { $in: productIds } });
      return res.json({ message: `تم حذف ${productIds.length} منتجات بنجاح` });
    }

    if (action === "updateStock" && typeof inStock === "boolean") {
      await Product.updateMany({ _id: { $in: productIds } }, { $set: { inStock } });
      return res.json({ message: `تم تحديث توفر ${productIds.length} منتجات` });
    }

    res.status(400).json({ message: "إجراء غير صالح" });
  } catch (error) {
    next(error);
  }
});

export default router;
