/**
 * Seed script: add test product configuration to "طقم ستريت" (6ab2ebf5289aaab56327c37a)
 * 
 * This sets up a Two-piece set with:
 * - Piece 1: "تنورة" (Skirt) with option "نمط التنورة" (Skirt Style): 
 *     كلوش (Cloche, +0), دبل كلوش (Double Cloche, +3), بليسيه (Pleated, +5 — with description override)
 * - Piece 2: "بلوزة" (Blouse) with option "نمط الكمّ" (Sleeve Style): 
 *     ربطة (Tie, +0, default), بالون (Balloon, +2), أساسي (Basic, +0)
 * 
 * Run: node scripts/seed-config.js
 * Requires MONGO_URI env var or .env file
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const PRODUCT_ID = "6ab2ebf5289aaab56327c37a";

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI. Set it in backend/.env or as environment variable.");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const productsCol = db.collection("products");

    const product = await productsCol.findOne({ _id: new mongoose.Types.ObjectId(PRODUCT_ID) });
    if (!product) {
      console.error(`❌ Product ${PRODUCT_ID} not found`);
      process.exit(1);
    }

    console.log(`📦 Found product: ${product.name}`);

    // Build configuration data
    const skirtStyleOption = {
      _id: new mongoose.Types.ObjectId(),
      name: "نمط التنورة",
      required: true,
      sortOrder: 0,
      dependsOnOptionId: null,
      dependsOnValueId: null,
      values: [
        {
          _id: new mongoose.Types.ObjectId(),
          label: "كلوش",
          priceAdjustment: 0,
          descriptionOverride: null,
          isDefault: true,
          sortOrder: 0,
          active: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          label: "دبل كلوش",
          priceAdjustment: 3,
          descriptionOverride: null,
          isDefault: false,
          sortOrder: 1,
          active: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          label: "بليسيه",
          priceAdjustment: 5,
          descriptionOverride: "تونيك ستريت مفتوح من الجنب مع تنورة بليسيه فاخرة — قماش عالي الجودة مع طيّات أنيقة",
          isDefault: false,
          sortOrder: 2,
          active: true,
        },
      ],
    };

    const sleeveStyleOption = {
      _id: new mongoose.Types.ObjectId(),
      name: "نمط الكمّ",
      required: false,
      sortOrder: 0,
      dependsOnOptionId: null,
      dependsOnValueId: null,
      values: [
        {
          _id: new mongoose.Types.ObjectId(),
          label: "ربطة",
          priceAdjustment: 0,
          descriptionOverride: null,
          isDefault: true,
          sortOrder: 0,
          active: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          label: "بالون",
          priceAdjustment: 2,
          descriptionOverride: null,
          isDefault: false,
          sortOrder: 1,
          active: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          label: "أساسي",
          priceAdjustment: 0,
          descriptionOverride: null,
          isDefault: false,
          sortOrder: 2,
          active: true,
        },
      ],
    };

    const pieces = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "تنورة",
        sortOrder: 0,
        options: [skirtStyleOption],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "بلوزة",
        sortOrder: 1,
        options: [sleeveStyleOption],
      },
    ];

    const result = await productsCol.updateOne(
      { _id: new mongoose.Types.ObjectId(PRODUCT_ID) },
      {
        $set: {
          configurable: true,
          pieces: pieces,
        },
      }
    );

    console.log(`✅ Updated product: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
    console.log("🧩 Configuration seeded:");
    console.log("   Piece 1: تنورة → نمط التنورة (كلوش +0 | دبل كلوش +3 | بليسيه +5)");
    console.log("   Piece 2: بلوزة → نمط الكمّ (ربطة +0 | بالون +2 | أساسي +0)");
    console.log(`\n🔗 Test at: https://albaysan-onlinefrontend.onrender.com/products/${PRODUCT_ID}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
