import mongoose from "mongoose";

// --- Product Configuration Sub-Schemas ---

const productOptionValueSchema = new mongoose.Schema({
  label: { type: String, required: true },
  priceAdjustment: { type: Number, default: 0 },
  descriptionOverride: { type: String, default: null },
  image: { type: String, default: "" },
  isDefault: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const productOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  // Conditional dependency: show this option only when a specific value is selected in another option
  dependsOnOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  dependsOnValueId: { type: mongoose.Schema.Types.ObjectId, default: null },
  values: [productOptionValueSchema],
});

const productPieceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sortOrder: { type: Number, default: 0 },
  options: [productOptionSchema],
});

// --- Main Product Schema ---

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
    // Product configuration fields
    configurable: { type: Boolean, default: false },
    pieces: { type: [productPieceSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: 1, productCollection: 1 });

export const Product = mongoose.model("Product", productSchema);
