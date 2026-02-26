// src/routes/upload.js ✅ REEMPLAZA TODO
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const { uploadBufferToCloudinary } = require("../cloudinary"); // ✅ usa tu helper

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// genera un id único (para no pisar archivos)
function makeId(prefix = "file") {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Falta archivo (file)" });
    }

    const folder = String(req.body.folder || "seller-applications");

    // cloudinary: image para imágenes, raw para pdf/otros
    const mimetype = String(req.file.mimetype || "");
    const isPdf = mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    const result = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      folder,
      publicId: makeId(isPdf ? "doc" : "img"),
      resourceType,
    });

    return res.json({
      ok: true,
      url: result.url,
      publicId: result.publicId,
      resourceType: result.resourceType,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({
      ok: false,
      error: "Upload failed",
      details: String(err?.message || err),
    });
  }
});

module.exports = router;
