import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const token = createToken(admin._id);
    res.json({
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

router.post("/setup", async (req, res, next) => {
  try {
    const existingAdmin = await Admin.countDocuments();
    if (existingAdmin > 0) {
      return res.status(403).json({ message: "تم إعداد المشرف مسبقاً" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username, passwordHash });
    const token = createToken(admin._id);

    res.status(201).json({
      message: "تم إنشاء حساب المشرف بنجاح",
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

