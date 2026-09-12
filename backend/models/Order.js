import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    qty: { type: Number, default: 1 },
    size: { type: String },
    color: { type: String },
    price: { type: Number },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["delivery", "reservation"], required: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    height: { type: String },
    weight: { type: String },
    items: [orderItemSchema],
    pickupDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "picked_up"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

orderSchema.index({ type: 1, status: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);

