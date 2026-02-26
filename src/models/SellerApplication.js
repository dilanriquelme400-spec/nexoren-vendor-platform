// src/models/SellerApplication.js
const mongoose = require("mongoose");

const SellerApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    storeName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    idFrontUrl: { type: String, required: true, trim: true },
    idBackUrl: { type: String, required: true, trim: true },
    selfieUrl: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SellerApplication ||
  mongoose.model("SellerApplication", SellerApplicationSchema);
