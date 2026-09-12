import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountTag: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    productCollection: { type: String, default: "" },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: 1, productCollection: 1 });

export const Product = mongoose.model("Product", productSchema);
