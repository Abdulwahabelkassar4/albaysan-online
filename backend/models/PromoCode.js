import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    endDate: {
      type: Date,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    scope: {
      type: String,
      enum: ["global", "categories", "products"],
      default: "global",
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
