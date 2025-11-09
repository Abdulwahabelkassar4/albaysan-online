import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/Product.js";
import { connectDB } from "./config/db.js";

dotenv.config();

(async () => {
  try {
    await connectDB();

    const sampleProducts = [
      {
        name: "عباية شامواه فاخرة",
        description: "عباية شامواه بتصميم أنيق ولمسة شرعية فريدة من مشاغل البيلسان الخاصة.",
        price: 65,
        category: "عباءات",
        collection: "الكوليكشن الشتوي",
        sizes: ["S", "M", "L", "XL"],
        colors: ["أسود", "رمادي"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1618354691547-7ec27b6dcdf8",
            publicId: "seed/albaylsan-winter-abaya",
          },
        ],
      },
      {
        name: "نقاب خفيف كريب",
        description: "نقاب عملي مريح مصنوع من قماش كريب خفيف يناسب الاستخدام اليومي.",
        price: 15,
        category: "نقابات",
        collection: "الكوليكشن الصيفي",
        sizes: ["حر"],
        colors: ["أسود"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1603252111749-3f5f5c7c7a49",
            publicId: "seed/albaylsan-summer-niqab",
          },
        ],
      },
      {
        name: "لباس سبور شرعي",
        description: "سبور شرعي يجمع بين الأناقة والراحة، مثالي للخروج اليومي والمشاوير.",
        price: 45,
        category: "سبورات شرعية",
        collection: "الكوليكشن الربيعي",
        sizes: ["M", "L"],
        colors: ["كحلي", "بيج"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
            publicId: "seed/albaylsan-sporty",
          },
        ],
      },
      {
        name: "حقيبة جلد أنيقة",
        description: "حقيبة نسائية أنيقة بلون فاخر تناسب الإطلالات الشرعية والمحتشمة.",
        price: 30,
        category: "حقائب",
        collection: "الكوليكشن الخريفي",
        sizes: ["حر"],
        colors: ["بني", "أسود"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1593032457869-4d91bbf1d2b5",
            publicId: "seed/albaylsan-bag",
          },
        ],
      },
    ];

    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log("✅ Sample products inserted successfully!");
  } catch (error) {
    console.error("Failed to seed products", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();
