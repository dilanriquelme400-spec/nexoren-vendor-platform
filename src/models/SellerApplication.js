const mongoose = require("mongoose");

const SellerApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  storeName: String,
  phone: String,
  country: String,
  address: String,

  idFrontUrl: String,
  idBackUrl: String,
  selfieUrl: String,

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SellerApplication", SellerApplicationSchema);
