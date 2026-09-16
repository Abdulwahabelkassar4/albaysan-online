import mongoose from "mongoose";

const offerSettingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "تخفيضات البيلسان الحصرية",
    },
    subtitle: {
      type: String,
      default: "خصومات مميزة على أرقى تشكيلات العباءات والسبورات الشرعية والنقابات لفترة محدودة",
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    badgeText: {
      type: String,
      default: "عرض لفترة محدودة 🔥",
    },
    promoCode: {
      type: String,
      default: "",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export const OfferSetting = mongoose.model("OfferSetting", offerSettingSchema);
