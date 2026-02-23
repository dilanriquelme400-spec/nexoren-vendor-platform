const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    resourceType: String,
    bytes: Number,
    format: String,
  },
  { _id: false }
);

const SellerApplicationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    review: {
      reviewedAt: { type: Date, default: null },
      reviewedBy: { type: String, default: null },
      reason: { type: String, default: null },
    },

    seller: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      storeName: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, required: true },
      address: { type: String, required: true },
    },

    files: {
      idFront: { type: FileSchema, default: null },
      idBack: { type: FileSchema, default: null },
      selfie: { type: FileSchema, default: null },
    },

    meta: {
      shopDomain: { type: String, default: null },
      ip: { type: String, default: null },
      userAgent: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerApplication", SellerApplicationSchema);
