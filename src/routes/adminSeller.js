const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/*
 ✅ IMPORTANTE
 Permitimos cargar el panel sin token.
 El token se pedirá desde el frontend.
*/

// =========================
// PANEL HTML
// =========================
router.get("/panel", (req, res) => {
  res.sendFile(require("path").join(__dirname, "../adminPanel.html"));
});

// =========================
// API ADMIN PROTEGIDA
// =========================
router.get("/sellers", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status && status !== "all" ? { status } : {};

    const rows = await SellerApplication.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ok: true,
      count: rows.length,
      rows,
    });
  } catch (err) {
    console.error("admin sellers error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
