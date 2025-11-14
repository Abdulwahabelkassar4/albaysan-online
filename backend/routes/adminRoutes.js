import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(admin._id);
    res.json({ token, username: admin.username });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, admin, (req, res) => {
  res.json({ admin: req.admin });
});

router.post("/setup", async (req, res, next) => {
  try {
    const existingAdmin = await Admin.countDocuments();
    if (existingAdmin > 0) {
      return res.status(403).json({ message: "Admin already configured" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username, password: hashedPassword });
    const token = createToken(admin._id);

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
