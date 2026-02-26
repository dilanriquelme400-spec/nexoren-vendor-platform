// src/routes/adminSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");

const router = express.Router();

/**
 * Admin auth middleware
 * Accepts:
 * - Authorization: Bearer <TOKEN>
 * - Authorization: <TOKEN>
 * - x-admin-token: <TOKEN>
 */
function requireAdmin(req, res, next) {
  const expected = (process.env.ADMIN_TOKEN || "").trim();
  if (!expected) {
    return res.status(500).json({ ok: false, error: "ADMIN_TOKEN no está configurado" });
  }

  const auth = String(req.headers.authorization || "").trim();
  const xToken = String(req.headers["x-admin-token"] || "").trim();

  let token = "";

  // Authorization: Bearer xxx
  if (auth.toLowerCase().startsWith("bearer ")) token = auth.slice(7).trim();
  // Authorization: xxx
  if (!token && auth) token = auth;
  // x-admin-token: xxx
  if (!token && xToken) token = xToken;

  if (!token || token !== expected) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }

  next();
}

/**
 * GET /admin/sellers
 * Optional query: ?status=pending|approved|rejected
 */
router.get("/sellers", requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || "").trim();
    const q = status ? { status } : {};
    const rows = await SellerApplication.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    console.error("admin list error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /admin/sellers/:id/approve
 */
router.post("/sellers/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await SellerApplication.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ ok: false, error: "No encontrado" });
    return res.json({ ok: true, id: doc._id, status: doc.status });
  } catch (err) {
    console.error("admin approve error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /admin/sellers/:id/reject
 */
router.post("/sellers/:id/reject", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await SellerApplication.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ ok: false, error: "No encontrado" });
    return res.json({ ok: true, id: doc._id, status: doc.status });
  } catch (err) {
    console.error("admin reject error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
