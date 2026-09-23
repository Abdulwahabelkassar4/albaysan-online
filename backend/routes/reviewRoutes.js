import express from "express";
import crypto from "crypto";
import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 1. GET /api/reviews/published
 * Public endpoint to fetch approved testimonials for storefront display
 */
router.get("/published", async (req, res, next) => {
  try {
    const { limit = 20, productId } = req.query;
    const filter = { status: "approved" };

    if (productId) {
      filter.$or = [
        { "taggedProducts.productId": productId },
        { isGeneralReview: true },
      ];
    }

    const reviews = await Review.find(filter)
      .select(
        "_id publicDisplayName rating comment isGeneralReview taggedProducts adminReply isPinned verifiedPurchase createdAt"
      )
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(Number(limit) || 20);

    // Calculate rating stats
    const allApproved = await Review.find({ status: "approved" }).select("rating");
    const totalReviews = allApproved.length;
    const avgRating = totalReviews > 0
      ? (allApproved.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

    res.json({
      data: reviews,
      stats: {
        totalReviews,
        avgRating: Number(avgRating),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/reviews/verify-token/:token
 * Public endpoint to check if private review token is valid & fetch order preview
 */
router.get("/verify-token/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ valid: false, message: "رمز التقييم غير موجود" });
    }

    const order = await Order.findOne({ reviewToken: token });
    if (!order) {
      return res.status(404).json({ valid: false, message: "رابط التقييم غير صالح أو منتهي الصلاحية" });
    }

    if (order.hasReviewed) {
      return res.status(400).json({
        valid: false,
        alreadyReviewed: true,
        message: "تم إرسال تقييم لهذا الطلب مسبقاً، شكراً جزيلاً لتعاونك!",
      });
    }

    // Extract purchased products for tagging
    const items = (order.items || []).map((item) => {
      let configSummary = "";
      if (item.configSnapshot && Array.isArray(item.configSnapshot) && item.configSnapshot.length > 0) {
        configSummary = item.configSnapshot
          .map((c) => `${c.pieceName ? c.pieceName + ": " : ""}${c.selectedValue}`)
          .join(" / ");
      }

      return {
        productId: item.productId,
        productName: item.name || "منتج من البيلسان",
        productImage: item.image || "",
        size: item.size || "",
        color: item.color || "",
        selectedPiecesSummary: configSummary,
      };
    });

    res.json({
      valid: true,
      customerName: order.customerName,
      items,
      orderType: order.type,
      orderDate: order.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 3. POST /api/reviews/submit
 * Public endpoint for customer to submit their review via secure token
 */
router.post("/submit", async (req, res, next) => {
  try {
    const { token, rating, comment, displayOption = "initials", isGeneralReview = true, taggedProducts = [] } = req.body;

    if (!token) {
      return res.status(400).json({ message: "رمز التحقق مطلوب" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "يرجى تحديد التقييم من 1 إلى 5 نجوم" });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "يرجى كتابة رأيك في التقييم" });
    }

    const order = await Order.findOne({ reviewToken: token });
    if (!order) {
      return res.status(404).json({ message: "رابط التقييم غير صالح" });
    }

    if (order.hasReviewed) {
      return res.status(400).json({ message: "تم إرسال تقييم لهذا الطلب مسبقاً" });
    }

    const newReview = new Review({
      orderId: order._id,
      reviewToken: token,
      customerName: order.customerName,
      phone: order.phone,
      displayOption: displayOption === "full_name" ? "full_name" : "initials",
      rating: Number(rating),
      comment: comment.trim(),
      isGeneralReview: Boolean(isGeneralReview),
      taggedProducts: Array.isArray(taggedProducts) ? taggedProducts : [],
      status: "pending",
      verifiedPurchase: true,
    });

    await newReview.save();

    // Mark order as reviewed
    order.hasReviewed = true;
    order.reviewId = newReview._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "تم إرسال تقييمك بنجاح! شكراً جزيلاً لتعاونك ومشاركتنا رأيك.",
      reviewId: newReview._id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 4. GET /api/reviews/admin
 * Admin endpoint to list all reviews with moderation filters
 */
router.get("/admin", authMiddleware, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 20;

    const [reviews, total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage),
      Review.countDocuments(filter),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      data: reviews,
      pagination: {
        total,
        page: currentPage,
        pages: Math.ceil(total / perPage),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 5. PUT /api/reviews/admin/:id/status
 * Admin endpoint to update moderation status or pin
 */
router.put("/admin/:id/status", authMiddleware, async (req, res, next) => {
  try {
    const { status, isPinned } = req.body;
    const update = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      update.status = status;
    }
    if (typeof isPinned === "boolean") {
      update.isPinned = isPinned;
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "التقييم غير موجود" });
    }

    res.json({ message: "تم تحديث حالة التقييم بنجاح", review });
  } catch (error) {
    next(error);
  }
});

/**
 * 6. PUT /api/reviews/admin/:id/reply
 * Admin endpoint to add or remove an admin reply
 */
router.put("/admin/:id/reply", authMiddleware, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "التقييم غير موجود" });
    }

    if (comment && comment.trim()) {
      review.adminReply = {
        comment: comment.trim(),
        repliedAt: new Date(),
      };
    } else {
      review.adminReply = undefined;
    }

    await review.save();
    res.json({ message: "تم حفظ رد المتجر بنجاح", review });
  } catch (error) {
    next(error);
  }
});

/**
 * 7. DELETE /api/reviews/admin/:id
 * Admin endpoint to delete a review
 */
router.delete("/admin/:id", authMiddleware, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "التقييم غير موجود" });
    }

    // Reset order hasReviewed state
    if (review.orderId) {
      await Order.findByIdAndUpdate(review.orderId, {
        $set: { hasReviewed: false, reviewId: null },
      });
    }

    res.json({ message: "تم حذف التقييم بنجاح" });
  } catch (error) {
    next(error);
  }
});

/**
 * 8. POST /api/reviews/admin/generate-token/:orderId
 * Generate or get existing review token for an order
 */
router.post("/admin/generate-token/:orderId", authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    if (!order.reviewToken) {
      order.reviewToken = crypto.randomBytes(12).toString("hex");
      order.reviewTokenCreatedAt = new Date();
      await order.save();
    }

    res.json({
      token: order.reviewToken,
      orderId: order._id,
      customerName: order.customerName,
      phone: order.phone,
      hasReviewed: order.hasReviewed,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
