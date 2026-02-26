// server.js (root)
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
      nodeEnv: process.env.NODE_ENV || null,
    },
  });
});

// ✅ (Opcional) montar upload routes si existe
try {
  const uploadRoutes = require("./src/routes/upload");
  app.use("/api", uploadRoutes); // /api/upload
  console.log("✅ upload routes mounted at /api");
} catch (e) {
  console.log("⚠️ upload routes NOT mounted:", e.message);
}

// routes
app.use("/api/seller", publicSellerRoutes);
app.use("/admin", adminSellerRoutes);

// 404 friendly
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found", path: req.path });
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
