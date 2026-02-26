// src/routes/adminSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/**
 * Admin auth:
 * acepta token desde:
 * - query: ?token=XXXX
 * - header: x-admin-token: XXXX
 * - header: Authorization: Bearer XXXX
 */
function requireAdmin(req, res, next) {
  const expected = (process.env.ADMIN_TOKEN || "").trim();

  // Si no existe en Railway, siempre fallará
  if (!expected) {
    return res.status(500).json({
      ok: false,
      error: "ADMIN_TOKEN no está configurado",
    });
  }

  const qToken = (req.query.token || "").trim();
  const hToken = (req.headers["x-admin-token"] || "").toString().trim();

  let bearer = "";
  const auth = (req.headers.authorization || "").toString();
  if (auth.toLowerCase().startsWith("bearer ")) {
    bearer = auth.slice(7).trim();
  }

  const provided = qToken || hToken || bearer;

  if (!provided || provided !== expected) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }

  next();
}

// GET /admin/sellers  -> lista solicitudes
router.get("/sellers", requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || "").trim(); // opcional: pending/approved/rejected
    const filter = status ? { status } : {};
    const rows = await SellerApplication.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    console.error("admin sellers error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// POST /admin/sellers/:id/status  body: { status: "approved"|"rejected"|"pending" }
router.post("/sellers/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const status = (req.body?.status || "").trim();

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Estado inválido" });
    }

    const doc = await SellerApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!doc) return res.status(404).json({ ok: false, error: "No encontrado" });

    res.json({ ok: true, id: doc._id, status: doc.status });
  } catch (err) {
    console.error("admin update status error:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
