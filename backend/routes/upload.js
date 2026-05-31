import express from "express";
import ImageKit from "imagekit";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WEBP, and AVIF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

router.post("/upload", authMiddleware, upload.array("images", 6), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const uploads = req.files.map(async (file, index) => {
      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${index}-${file.originalname}`,
      });
      return uploadResult.url;
    });

    const urls = await Promise.all(uploads);
    return res.json({ urls });
  } catch (error) {
    return res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
