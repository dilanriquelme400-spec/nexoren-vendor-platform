const express = require("express");
const router = express.Router();
const Seller = require("../models/SellerApplication");
const requireAdmin = require("../middleware/requireShopifyAdmin");

// obtener solicitudes
router.get("/", requireAdmin, async (req, res) => {
  const sellers = await Seller.find().sort({ createdAt: -1 });
  res.json(sellers);
});

// aprobar
router.post("/:id/approve", requireAdmin, async (req, res) => {
  await Seller.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ ok: true });
});

// rechazar
router.post("/:id/reject", requireAdmin, async (req, res) => {
  await Seller.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ ok: true });
});

module.exports = router;
