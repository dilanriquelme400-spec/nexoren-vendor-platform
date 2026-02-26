// src/routes/upload.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");

const router = express.Router();

// Multer en memoria (no guarda archivos en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

function bufferToBase64(file) {
  const b64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${b64}`;
}

/**
 * POST /api/upload
 * FormData:
 * - file: (imagen/pdf)
 * - folder: (opcional) ej: "seller-applications"
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "Falta archivo (file)" });
    }

    const folder = String(req.body.folder || "seller-applications");
    const dataUri = bufferToBase64(req.file);

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto", // permite jpg/png/pdf
    });

    return res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

module.exports = router;
