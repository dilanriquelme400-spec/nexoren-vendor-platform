// src/routes/upload.js — REEMPLAZA TODO
const express = require("express");
const multer = require("multer");
const { uploadBufferToCloudinary } = require("../cloudinary");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Falta archivo (file)" });
    }

    const folder = String(req.body.folder || "seller-applications");

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
