// server.js (root) — REEMPLAZA TODO
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/db");

const publicSellerRoutes = require("./src/routes/publicSeller");
const adminSellerRoutes = require("./src/routes/adminSeller");

const app = express();

// Railway / proxies
app.set("trust proxy", 1);

// middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ RUTA PRINCIPAL
app.get("/", (req, res) => {
  res.status(200).send("Nexoren Vendor Platform está vivo ✅ (API)");
});

// ✅ HEALTHCHECK
app.get("/health", async (req, res) => {
  let mongoConnected = false;
  try {
    const mongoose = require("mongoose");
    mongoConnected = mongoose.connection.readyState === 1;
  } catch (e) {}

  res.json({
    ok: true,
    status: "healthy",
    mongoConnected,
    env: {
      hasMongoURL: !!process.env.MONGO_URL,
      hasCloudinary:
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET,
      requireDocs: String(process.env.REQUIRE_DOCS || "").toLowerCase() === "true",
      hasAdminToken: !!process.env.ADMIN_TOKEN,
    },
  });
});

// ✅ Rutas principales
app.use("/api/seller", publicSellerRoutes);
app.use("/admin", adminSellerRoutes);

// ✅ Intentar montar upload SOLO si existe y no rompe
try {
  // OJO: este archivo debe existir: src/routes/upload.js
  const uploadRoutes = require("./src/routes/upload");
  app.use("/api/upload", uploadRoutes);
  console.log("✅ /api/upload mounted");
} catch (err) {
  console.warn("⚠️ /api/upload NO montado (no existe o falló require):", err.message);
}

// ✅ 404 JSON
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ✅ Error handler global
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  return res.status(500).json({ ok: false, error: "Server error" });
});

// start
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
