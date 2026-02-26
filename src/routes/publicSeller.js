// src/routes/publicSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/**
 * POST /api/seller/apply
 * Body JSON:
 * { fullName, email, storeName, phone, country, address, idFrontUrl, idBackUrl, selfieUrl }
 */
router.post("/apply", async (req, res) => {
  try {
    const {
      fullName,
      email,
      storeName,
      phone,
      country,
      address,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
    } = req.body || {};

    const missing = [];
    if (!fullName) missing.push("fullName");
    if (!email) missing.push("email");
    if (!storeName) missing.push("storeName");
    if (!phone) missing.push("phone");
    if (!country) missing.push("country");
    if (!address) missing.push("address");
    if (!idFrontUrl) missing.push("idFrontUrl");
    if (!idBackUrl) missing.push("idBackUrl");
    if (!selfieUrl) missing.push("selfieUrl");

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios",
        missing,
      });
    }

    const doc = await SellerApplication.create({
      fullName,
      email,
      storeName,
      phone,
      country,
      address,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      status: "pending",
    });

    return res.json({ ok: true, id: doc._id, status: doc.status });
  } catch (err) {
    console.error("apply error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
