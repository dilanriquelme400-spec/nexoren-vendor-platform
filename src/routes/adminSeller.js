// src/routes/adminSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

/**
 * GET /admin/sellers?status=pending
 * Header: x-admin-token
 */
router.get("/sellers", requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const filter = status ? { status } : {};

    const rows = await SellerApplication.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    console.error("admin sellers list error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /admin/sellers/:id
 * Header: x-admin-token
 */
router.get("/sellers/:id", requireAdmin, async (req, res) => {
  try {
    const row = await SellerApplication.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, row });
  } catch (err) {
    console.error("admin sellers get error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /admin/sellers/:id/approve
 * Header: x-admin-token
 */
router.post("/sellers/:id/approve", requireAdmin, async (req, res) => {
  try {
    const row = await SellerApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "approved" } },
      { new: true }
    ).lean();

    if (!row) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, row });
  } catch (err) {
    console.error("approve error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /admin/sellers/:id/reject
 * Header: x-admin-token
 */
router.post("/sellers/:id/reject", requireAdmin, async (req, res) => {
  try {
    const row = await SellerApplication.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "rejected" } },
      { new: true }
    ).lean();

    if (!row) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, row });
  } catch (err) {
    console.error("reject error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

module.exports = router;
