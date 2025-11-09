import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, index: true },
    collection: { type: String },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    images: [imageSchema],
    inStock: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

productSchema.index({ name: "text", description: "text", category: 1, collection: 1 });

export const Product = mongoose.model("Product", productSchema);

