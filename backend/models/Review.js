import mongoose from "mongoose";

const taggedProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    productImage: { type: String },
    selectedPiecesSummary: { type: String },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    // Reference to Order & Cryptographic Token
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    reviewToken: {
      type: String,
      required: true,
      index: true,
    },

    // Customer Identity & Privacy Controls
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    displayOption: {
      type: String,
      enum: ["full_name", "initials"],
      default: "initials",
    },
    publicDisplayName: { type: String },

    // Review Content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Tagged Products from Order
    isGeneralReview: { type: Boolean, default: true },
    taggedProducts: [taggedProductSchema],

    // Moderation & Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminReply: {
      comment: { type: String, trim: true },
      repliedAt: { type: Date },
    },
    isPinned: { type: Boolean, default: false },
    verifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Calculate initials for Arabic and English names
reviewSchema.pre("save", function (next) {
  if (this.displayOption === "initials") {
    const parts = (this.customerName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      this.publicDisplayName = "عميل";
    } else if (parts.length === 1) {
      this.publicDisplayName = `${parts[0].charAt(0)}.`;
    } else {
      this.publicDisplayName = `${parts[0].charAt(0)}. ${parts[parts.length - 1].charAt(0)}.`;
    }
  } else {
    this.publicDisplayName = this.customerName;
  }
  next();
});

export const Review = mongoose.model("Review", reviewSchema);
export default Review;
