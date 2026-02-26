// server.js (root)
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/db");

const publicSellerRoutes = require("./src/routes/publicSeller");
const adminSellerRoutes = require("./src/routes/adminSeller");
const uploadRoutes = require("./src/routes/upload");

const app = express();

// Railway / proxies
app.set("trust proxy", 1);

// middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ HOME
app.get("/", (req, res) => {
  res.status(200).send("Nexoren Vendor Platform está vivo ✅ (API)");
});

// ✅ HEALTH
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
      hasAdminToken: !!process.env.ADMIN_TOKEN,
      hasCloudinary:
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET,
    },
  });
});

// ✅ ROUTES
app.use("/api/seller", publicSellerRoutes);
app.use("/admin", adminSellerRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ NOT FOUND (para que no “muera” cuando visitas rutas malas)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// ✅ START
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
