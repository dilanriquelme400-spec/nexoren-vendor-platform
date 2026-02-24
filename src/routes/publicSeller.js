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
 *
 * NOTA:
 * - Si process.env.REQUIRE_DOCS === "true", se exigen las 3 URLs.
 * - Si REQUIRE_DOCS no está en true, se permite enviar sin URLs y queda status "missing_docs".
 */

function isValidEmail(email) {
  if (!email) return false;
  // validación básica suficiente para formularios
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

function cleanStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

router.post("/apply", async (req, res) => {
  try {
    const body = req.body || {};

    const fullName = cleanStr(body.fullName);
    const email = cleanStr(body.email).toLowerCase();
    const storeName = cleanStr(body.storeName);
    const phone = cleanStr(body.phone);
    const country = cleanStr(body.country);
    const address = cleanStr(body.address);

    const idFrontUrl = cleanStr(body.idFrontUrl);
    const idBackUrl = cleanStr(body.idBackUrl);
    const selfieUrl = cleanStr(body.selfieUrl);

    const REQUIRE_DOCS = String(process.env.REQUIRE_DOCS || "").toLowerCase() === "true";

    // Campos base (siempre obligatorios)
    const missing = [];
    if (!fullName) missing.push("fullName");
    if (!email) missing.push("email");
    if (!storeName) missing.push("storeName");
    if (!phone) missing.push("phone");
    if (!country) missing.push("country");
    if (!address) missing.push("address");

    // Validación de email
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: "Email inválido",
        field: "email",
      });
    }

    // Documentos: obligatorios solo si REQUIRE_DOCS=true
    if (REQUIRE_DOCS) {
      if (!idFrontUrl) missing.push("idFrontUrl");
      if (!idBackUrl) missing.push("idBackUrl");
      if (!selfieUrl) missing.push("selfieUrl");
    }

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios",
        missingFields: missing,
        requireDocs: REQUIRE_DOCS,
      });
    }

    // Evitar spameo de solicitudes pendientes por el mismo email (opcional, pero útil)
    const existingPending = await SellerApplication.findOne({
      email,
      status: { $in: ["pending", "missing_docs"] },
    }).lean();

    if (existingPending) {
      return res.status(409).json({
        ok: false,
        error: "Ya existe una solicitud pendiente para este email",
        existingId: existingPending._id,
        status: existingPending.status,
      });
    }

    // Status dinámico según si llegaron URLs
    const hasAllDocs = !!(idFrontUrl && idBackUrl && selfieUrl);
    const status = hasAllDocs ? "pending" : "missing_docs";

    const doc = await SellerApplication.create({
      fullName,
      email,
      storeName,
      phone,
      country,
      address,
      idFrontUrl: idFrontUrl || null,
      idBackUrl: idBackUrl || null,
      selfieUrl: selfieUrl || null,
      status,
    });

    return res.json({
      ok: true,
      id: doc._id,
      status: doc.status,
      requireDocs: REQUIRE_DOCS,
      savedDocs: {
        idFrontUrl: !!doc.idFrontUrl,
        idBackUrl: !!doc.idBackUrl,
        selfieUrl: !!doc.selfieUrl,
      },
    });
  } catch (err) {
    console.error("apply error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
