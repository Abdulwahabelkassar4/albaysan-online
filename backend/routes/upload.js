import express from "express";
import ImageKit from "imagekit";
import multer from "multer";

console.log("⚡ Upload route loaded");

const router = express.Router();

const upload = multer();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

router.post("/upload", upload.array("images"), async (req, res) => {
  console.log("📥 Incoming files:", req.files);
  console.log("📥 Incoming body:", req.body);

  if (!req.files?.length) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const uploads = req.files.map(async (file) => {
      console.log("🔧 Uploading:", file.originalname);

      const uploadResult = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
      });

      console.log("✅ Uploaded to ImageKit:", uploadResult.url);

      return uploadResult.url;
    });

    const urls = await Promise.all(uploads);
    return res.json({ urls });
  } catch (err) {
    console.error("❌ Image upload failed:", err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
