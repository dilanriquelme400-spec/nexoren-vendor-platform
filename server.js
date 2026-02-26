// server.js (root) — REEMPLAZA TODO EL ARCHIVO COMPLETO CON ESTO
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/db");

const publicSellerRoutes = require("./src/routes/publicSeller");
const adminSellerRoutes = require("./src/routes/adminSeller");
const uploadRoutes = require("./src/routes/upload"); // ✅ AÑADIDO

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

// ✅ ROUTES (ORDEN CLARO)
app.use("/api/upload", uploadRoutes); // ✅ POST https://TU-RAILWAY/api/upload
app.use("/api/seller", publicSellerRoutes); // ✅ POST https://TU-RAILWAY/api/seller/apply
app.use("/admin", adminSellerRoutes); // ✅ GET https://TU-RAILWAY/admin/sellers

// ✅ 404 JSON para rutas que no existan (para debug)
app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ✅ Manejo de errores global (para que Railway no se “cuelgue” sin respuesta)
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
