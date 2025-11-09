import express from "express";
import { Order } from "../models/Order.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { type, customerName, phone, address, items, pickupDate } = req.body;

    if (!type || !customerName || !phone) {
      return res.status(400).json({ message: "النوع والاسم والرقم مطلوبة" });
    }

    if (type === "delivery" && !address) {
      return res.status(400).json({ message: "العنوان مطلوب للتوصيل" });
    }

    if (type === "reservation" && !pickupDate) {
      return res.status(400).json({ message: "تاريخ الاستلام مطلوب للحجز" });
    }

    const order = await Order.create({
      ...req.body,
      status: "pending",
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filters = {};

    if (type) filters.type = type;
    if (status) filters.status = status;

    const orders = await Order.find(filters).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

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
    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;

