import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-passwordHash");

    if (!admin) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "غير مصرح" });
  }
};

export const authMiddleware = protect;
