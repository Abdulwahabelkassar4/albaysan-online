import express from "express";
import crypto from "crypto";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { PromoCode } from "../models/PromoCode.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate, orderSchema } from "../middleware/validate.js";

const router = express.Router();

// Create new order (Public) — with server-side configuration validation
router.post("/", async (req, res, next) => {
  try {
    const { type, customerName, phone, address, items, pickupDate, promoCode, discountAmount } = req.body;

    if (!type || !customerName || !phone) {
      return res.status(400).json({ message: "النوع والاسم ورقم الهاتف مطلوبة" });
    }

    if (type === "delivery" && !address) {
      return res.status(400).json({ message: "العنوان مطلوب للتوصيل" });
    }

    if (type === "reservation" && !pickupDate) {
      return res.status(400).json({ message: "تاريخ الاستلام مطلوب للحجز" });
    }

    // Server-side price recalculation for configured products
    const validatedItems = [];
    for (const item of (items || [])) {
      const validatedItem = { ...item };

      // If this item has product configuration, validate & recalculate server-side
      if (item.configuration && item.configuration.productId && item.configuration.selections) {
        const product = await Product.findById(item.configuration.productId);
        if (!product || !product.configurable) {
          return res.status(400).json({
            message: `المنتج غير موجود أو غير قابل للتهيئة: ${item.name || item.configuration.productId}`,
          });
        }

        const selections = item.configuration.selections;
        let totalAdjustment = 0;
        const configSnapshot = [];

        for (const piece of product.pieces) {
          for (const option of piece.options) {
            const optionIdStr = option._id.toString();
            const selectedValueId = selections[optionIdStr];

            // Check conditional dependency
            if (option.dependsOnOptionId && option.dependsOnValueId) {
              const parentSelectedValue = selections[option.dependsOnOptionId.toString()];
              if (parentSelectedValue !== option.dependsOnValueId.toString()) {
                continue;
              }
            }

            if (option.required && !selectedValueId) {
              return res.status(400).json({
                message: `الخيار "${option.name}" مطلوب في المنتج "${product.name}"`,
              });
            }

            if (!selectedValueId) continue;

            const value = option.values.find(
              (v) => v._id.toString() === selectedValueId && v.active !== false
            );

            if (!value) {
              return res.status(400).json({
                message: `قيمة غير صالحة للخيار "${option.name}" في المنتج "${product.name}"`,
              });
            }

            const adjustment = Number(value.priceAdjustment) || 0;
            if (adjustment < 0) {
              return res.status(400).json({
                message: `تعديل سعر غير صالح للخيار "${option.name}"`,
              });
            }

            totalAdjustment += adjustment;

            configSnapshot.push({
              pieceName: piece.name,
              optionName: option.name,
              selectedValue: value.label,
              priceAdjustment: adjustment,
            });
          }
        }

        const serverBasePrice = Number(product.price);
        const serverConfiguredPrice = serverBasePrice + totalAdjustment;

        // Override client price with server-calculated price
        validatedItem.price = serverConfiguredPrice;
        validatedItem.basePrice = serverBasePrice;
        validatedItem.configuredPrice = serverConfiguredPrice;
        validatedItem.configSnapshot = configSnapshot;

        // Determine description used
        let descUsed = product.description || "";
        for (const piece of product.pieces) {
          for (const option of piece.options) {
            const selVal = selections[option._id.toString()];
            if (!selVal) continue;
            const val = option.values.find((v) => v._id.toString() === selVal);
            if (val?.descriptionOverride) descUsed = val.descriptionOverride;
          }
        }
        validatedItem.descriptionUsed = descUsed;
      }

      // Remove frontend-only fields
      delete validatedItem.lineId;
      delete validatedItem.configuration;
      validatedItems.push(validatedItem);
    }

    const deliveryFee = type === "delivery" ? 2 : 0;
    const itemsPrice = validatedItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
      0
    );
    const validDiscount = Math.max(0, Number(discountAmount) || 0);
    const calculatedTotal = Math.max(0, itemsPrice - validDiscount) + deliveryFee;

    const order = await Order.create({
      ...req.body,
      items: validatedItems,
      address: type === "delivery" ? address : (address || "استلام من المتجر"),
      deliveryFee,
      discountAmount: validDiscount,
      promoCode: promoCode || "",
      totalPrice: calculatedTotal,
      status: "pending",
    });

    if (promoCode) {
      await PromoCode.updateOne(
        { code: promoCode.trim().toUpperCase() },
        { $inc: { usageCount: 1 } }
      ).catch((err) => console.error("Error updating promo code usage count:", err));
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Get admin analytics stats
router.get("/stats", authMiddleware, async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const completedOrders = await Order.countDocuments({ status: { $in: ["delivered", "picked_up"] } });
    
    const deliveryCount = await Order.countDocuments({ type: "delivery" });
    const reservationCount = await Order.countDocuments({ type: "reservation" });

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    // Calculate revenue from orders
    const orders = await Order.find();
    let totalRevenue = 0;
    const monthlyStatsMap = {};

    orders.forEach((ord) => {
      const orderTotal = ord.totalPrice !== undefined && ord.totalPrice > 0
        ? ord.totalPrice
        : (ord.items || []).reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
            0
          ) + (ord.type === "delivery" ? 2 : 0);
      totalRevenue += orderTotal;

      const monthKey = new Date(ord.createdAt).toLocaleDateString("ar-EG", {
        month: "short",
        year: "numeric",
      });
      monthlyStatsMap[monthKey] = (monthlyStatsMap[monthKey] || 0) + orderTotal;
    });

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      deliveryCount,
      reservationCount,
      totalRevenue,
      recentOrders,
      monthlyRevenue: Object.entries(monthlyStatsMap).map(([month, revenue]) => ({
        month,
        revenue,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get orders list with pagination & search
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const filters = {};

    if (type) filters.type = type;
    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 20;

    const total = await Order.countDocuments(filters);
    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.json({
      data: orders,
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

// Update order status
router.put("/:id/status", authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "الحالة مطلوبة" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    order.status = status;
    if (["delivered", "picked_up"].includes(status) && !order.reviewToken) {
      order.reviewToken = crypto.randomBytes(12).toString("hex");
      order.reviewTokenCreatedAt = new Date();
    }
    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Delete single order
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }
    res.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error) {
    next(error);
  }
});

// Bulk action (delete / update status)
router.post("/bulk", authMiddleware, async (req, res, next) => {
  try {
    const { orderIds, action, status } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "يرجى تحديد الطلبات" });
    }

    if (action === "delete") {
      await Order.deleteMany({ _id: { $in: orderIds } });
      return res.json({ message: `تم حذف ${orderIds.length} طلبات بنجاح` });
    }

    if (action === "updateStatus" && status) {
      await Order.updateMany({ _id: { $in: orderIds } }, { $set: { status } });
      return res.json({ message: `تم تحديث حالة ${orderIds.length} طلبات` });
    }

    res.status(400).json({ message: "إجراء غير صالح" });
  } catch (error) {
    next(error);
  }
});

export default router;
