// src/routes/adminSeller.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Todo /admin requiere token
router.use(requireAdmin);

// GET /admin/sellers?status=pending
router.get("/sellers", async (req, res) => {
  const status = req.query.status;
  const filter = status ? { status } : {};
  const items = await SellerApplication.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

// POST /admin/sellers/:id/approve
router.post("/sellers/:id/approve", async (req, res) => {
  const { id } = req.params;
  const adminNote = (req.body && req.body.adminNote) || "";

  const updated = await SellerApplication.findByIdAndUpdate(
    id,
    { status: "approved", adminNote },
    { new: true }
  );

  if (!updated) return res.status(404).json({ ok: false, error: "No existe" });
  res.json({ ok: true, item: updated });
});

// POST /admin/sellers/:id/reject
router.post("/sellers/:id/reject", async (req, res) => {
  const { id } = req.params;
  const adminNote = (req.body && req.body.adminNote) || "";

  const updated = await SellerApplication.findByIdAndUpdate(
    id,
    { status: "rejected", adminNote },
    { new: true }
  );

  if (!updated) return res.status(404).json({ ok: false, error: "No existe" });
  res.json({ ok: true, item: updated });
});

module.exports = router;
