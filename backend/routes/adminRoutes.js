import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isSetupEnabled = () => process.env.ENABLE_ADMIN_SETUP === "true";
const readSetupToken = (req) => req.headers["x-setup-token"] || req.body.setupToken;

const ensureSetupAccess = (req, res) => {
  if (!isSetupEnabled()) {
    res.status(403).json({ message: "Admin setup is disabled" });
    return false;
  }

  if (!process.env.ADMIN_SETUP_TOKEN) {
    res.status(500).json({ message: "Server missing ADMIN_SETUP_TOKEN" });
    return false;
  }

  const providedSetupToken = readSetupToken(req);
  if (providedSetupToken !== process.env.ADMIN_SETUP_TOKEN) {
    res.status(403).json({ message: "Invalid setup token" });
    return false;
  }

  return true;
};

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = String(username || "").trim();

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const usernamePattern = new RegExp(`^${escapeRegex(normalizedUsername)}$`, "i");
    const admin = await Admin.findOne({ username: usernamePattern });

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
    if (!ensureSetupAccess(req, res)) {
      return;
    }

    const existingAdmin = await Admin.countDocuments();
    if (existingAdmin > 0) {
      return res.status(403).json({ message: "Admin already configured" });
    }

    const { username, password } = req.body;
    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username: normalizedUsername, password: hashedPassword });
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

// Temporary recovery endpoint: keep ENABLE_ADMIN_SETUP=true while using it, then disable.
router.post("/reset-password", async (req, res, next) => {
  try {
    if (!ensureSetupAccess(req, res)) {
      return;
    }

    const { username, password } = req.body;
    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const usernamePattern = new RegExp(`^${escapeRegex(normalizedUsername)}$`, "i");
    const existingAdmin = await Admin.findOne({ username: usernamePattern });
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    existingAdmin.password = await bcrypt.hash(password, 12);
    if (!existingAdmin.username || existingAdmin.username !== normalizedUsername) {
      existingAdmin.username = normalizedUsername;
    }
    await existingAdmin.save();

    return res.json({
      message: "Admin password updated successfully",
      admin: { id: existingAdmin._id, username: existingAdmin.username },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
