const express = require("express");
const rateLimit = require("express-rate-limit");
const multer = require("multer");

const SellerApplication = require("../models/SellerApplication");
const { uploadBufferToCloudinary } = require("../cloudinary");

const router = express.Router();

// Rate limit para que no te spameen
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

function safeStr(v) {
  return (v || "").toString().trim();
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v);
}

// POST /api/seller/apply
router.post(
  "/apply",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const fullName = safeStr(req.body.fullName);
      const email = safeStr(req.body.email);
      const storeName = safeStr(req.body.storeName);
      const phone = safeStr(req.body.phone);
      const country = safeStr(req.body.country);
      const address = safeStr(req.body.address);
      const shopDomain = safeStr(req.body.shopDomain);

      if (!fullName || !email || !storeName || !phone || !country || !address) {
        return res.status(400).json({ ok: false, error: "Missing required fields" });
      }
      if (!isEmail(email)) {
        return res.status(400).json({ ok: false, error: "Invalid email" });
      }

      const files = req.files || {};
      const f1 = files.idFront?.[0];
      const f2 = files.idBack?.[0];
      const f3 = files.selfie?.[0];

      if (!f1 || !f2 || !f3) {
        return res.status(400).json({ ok: false, error: "Missing files (idFront, idBack, selfie)" });
      }

      // Creamos primero el doc (para tener un id y usarlo en carpeta Cloudinary)
      const appDoc = await SellerApplication.create({
        seller: { fullName, email, storeName, phone, country, address },
        meta: {
          shopDomain: shopDomain || null,
          ip: (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.socket.remoteAddress || null,
          userAgent: req.headers["user-agent"] || null,
        },
        status: "pending",
      });

      const folder = `nexoren/seller-verification/${appDoc._id.toString()}`;

      // Subir a Cloudinary
      const [upFront, upBack, upSelfie] = await Promise.all([
        uploadBufferToCloudinary({ buffer: f1.buffer, folder, publicId: "id-front", resourceType: "image" }),
        uploadBufferToCloudinary({ buffer: f2.buffer, folder, publicId: "id-back", resourceType: "image" }),
        uploadBufferToCloudinary({ buffer: f3.buffer, folder, publicId: "selfie", resourceType: "image" }),
      ]);

      appDoc.files.idFront = upFront;
      appDoc.files.idBack = upBack;
      appDoc.files.selfie = upSelfie;
      await appDoc.save();

      return res.json({ ok: true, applicationId: appDoc._id.toString() });
    } catch (e) {
      console.error("Apply error:", e);
      return res.status(500).json({ ok: false, error: "Server error" });
    }
  }
);

module.exports = router;
