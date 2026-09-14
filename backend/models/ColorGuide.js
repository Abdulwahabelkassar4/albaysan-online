import mongoose from "mongoose";

const colorGuideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    hexCode: { type: String, required: true, trim: true }, // e.g. #8B0000 or rgb
    imageUrl: { type: String, default: "" }, // fabric photo sample URL
    description: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ColorGuide = mongoose.model("ColorGuide", colorGuideSchema);
