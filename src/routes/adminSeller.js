const express = require("express");
const SellerApplication = require("../models/SellerApplication");
const { requireShopifyAdmin } = require("../middleware/requireShopifyAdmin");

const router = express.Router();

// Todas estas rutas sólo admin (account owner)
router.use(requireShopifyAdmin);

// GET /api/admin/seller-applications?status=pending
router.get("/seller-applications", async (req, res) => {
  try {
    const status = (req.query.status || "pending").toString();
    const query = ["pending", "approved", "rejected"].includes(status) ? { status } : {};

    const items = await SellerApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Failed to fetch" });
  }
});

// POST /api/admin/seller-applications/:id/approve
router.post("/seller-applications/:id/approve", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await SellerApplication.findByIdAndUpdate(
      id,
      {
        status: "approved",
        review: {
          reviewedAt: new Date(),
          reviewedBy: req.shopifyUser?.email || "account_owner",
          reason: null,
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Approve failed" });
  }
});

// POST /api/admin/seller-applications/:id/reject
router.post("/seller-applications/:id/reject", async (req, res) => {
  try {
    const id = req.params.id;
    const reason = (req.body.reason || "").toString().trim().slice(0, 500) || "Rejected";

    const updated = await SellerApplication.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        review: {
          reviewedAt: new Date(),
          reviewedBy: req.shopifyUser?.email || "account_owner",
          reason,
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Reject failed" });
  }
});

module.exports = router;
