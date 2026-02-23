// src/models/SellerApplication.js
const mongoose = require("mongoose");

const SellerApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    storeName: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },

    // URLs (Cloudinary o lo que uses)
    idFrontUrl: { type: String, required: true },
    idBackUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SellerApplication ||
  mongoose.model("SellerApplication", SellerApplicationSchema);
