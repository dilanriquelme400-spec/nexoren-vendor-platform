// src/routes/publicSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/**
 * POST /api/seller/apply
 * Body esperado (JSON) ideal:
 * {
 *   fullName, email, storeName, phone, country, address,
 *   idFrontUrl, idBackUrl, selfieUrl
 * }
 *
 * Nota:
 * - Si REQUIRE_DOCS === "true" => se exigen las 3 URLs
 * - Si REQUIRE_DOCS !== "true" => se permite enviar sin URLs y queda status "missing_docs"
 */

function cleanStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(email).trim());
}

// toma el primer valor no-vacío de una lista de keys posibles
function pick(body, keys) {
  for (const k of keys) {
    const v = cleanStr(body?.[k]);
    if (v) return v;
  }
  return "";
}

router.post("/apply", async (req, res) => {
  try {
    const body = req.body || {};

    // ✅ tolerante a variantes de nombres
    const fullName = pick(body, ["fullName", "fullname", "full_name", "name"]);
    const email = pick(body, ["email", "mail"]).toLowerCase();
    const storeName = pick(body, ["storeName", "storename", "store_name", "store"]);
    const phone = pick(body, ["phone", "phoneNumber", "phonenumber", "tel"]);
    const country = pick(body, ["country", "pais"]);
    const address = pick(body, ["address", "direccion"]);

    const idFrontUrl = pick(body, ["idFrontUrl", "idFrontURL", "id_front_url", "idFront"]);
    const idBackUrl = pick(body, ["idBackUrl", "idBackURL", "id_back_url", "idBack"]);
    const selfieUrl = pick(body, ["selfieUrl", "selfieURL", "selfie_url", "selfie"]);

    const REQUIRE_DOCS = String(process.env.REQUIRE_DOCS || "").toLowerCase() === "true";

    // ✅ campos base obligatorios
    const missing = [];
    if (!fullName) missing.push("fullName");
    if (!email) missing.push("email");
    if (!storeName) missing.push("storeName");
    if (!phone) missing.push("phone");
    if (!country) missing.push("country");
    if (!address) missing.push("address");

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios",
        missingFields: missing,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: "Email inválido",
        field: "email",
      });
    }

    // ✅ docs según modo
    if (REQUIRE_DOCS) {
      const missingDocs = [];
      if (!idFrontUrl) missingDocs.push("idFrontUrl");
      if (!idBackUrl) missingDocs.push("idBackUrl");
      if (!selfieUrl) missingDocs.push("selfieUrl");

      if (missingDocs.length) {
        return res.status(400).json({
          ok: false,
          error: "Faltan documentos (URLs)",
          missingFields: missingDocs,
          requireDocs: true,
        });
      }
    }

    // opcional: evitar spam duplicado (pendiente)
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

    // status dinámico si llegaron docs o no
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
