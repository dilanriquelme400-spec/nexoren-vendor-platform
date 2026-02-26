// src/routes/upload.js — REEMPLAZA TODO EL ARCHIVO COMPLETO CON ESTO
const express = require("express");
const multer = require("multer");
const { uploadBufferToCloudinary } = require("../cloudinary");

const router = express.Router();

// Multer en memoria (no guarda archivos en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
});

/**
 * POST /api/upload
 * FormData:
 * - file: (imagen/pdf)
 * - folder: (opcional) ej: "seller-applications"
 *
 * Respuesta:
 * { ok:true, url, publicId, resourceType, bytes, format }
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Falta archivo (file)" });
    }

    const folder = String(req.body.folder || "seller-applications");

    // Detectar tipo: PDF a "raw", imágenes a "image"
    const mimetype = String(req.file.mimetype || "");
    const isPdf = mimetype === "application/pdf" || req.file.originalname?.toLowerCase().endsWith(".pdf");

    const result = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      folder,
      resourceType: isPdf ? "raw" : "image",
    });

    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({
      ok: false,
      error: "Upload failed",
      detail: String(err?.message || err),
    });
  }
});

module.exports = router;
