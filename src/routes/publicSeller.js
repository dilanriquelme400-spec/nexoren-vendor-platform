// src/routes/publicSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/**
 * POST /api/seller/apply
 * Body esperado (JSON):
 * {
 *   fullName, email, storeName, phone, country, address,
 *   idFrontUrl, idBackUrl, selfieUrl
 * }
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

    if (
      !fullName ||
      !email ||
      !storeName ||
      !phone ||
      !country ||
      !address ||
      !idFrontUrl ||
      !idBackUrl ||
      !selfieUrl
    ) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios",
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
