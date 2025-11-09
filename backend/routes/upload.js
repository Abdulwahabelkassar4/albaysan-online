import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir }); // temp storage

router.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ message: "لم يتم العثور على ملف للرفع" });
  }

  try {
    if (
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      return res.status(500).json({ message: "بيانات ImageKit غير مكتملة" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("fileName", req.file.originalname);

    const response = await axios.post(
      "https://upload.imagekit.io/api/v1/files/upload",
      form,
      {
        auth: {
          username: process.env.IMAGEKIT_PRIVATE_KEY,
          password: "",
        },
        headers: form.getHeaders(),
      }
    );

    res.json({
      url: response.data.url,
      publicId: response.data.fileId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  } finally {
    fs.unlink(filePath, (unlinkError) => {
      if (unlinkError) {
        console.error("Failed to clean up uploaded file:", unlinkError);
      }
    });
  }
});

export default router;
