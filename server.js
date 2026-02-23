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
  res
    .status(200)
    .send("Nexoren Vendor Platform está vivo ✅ (API)");
});

// ✅ HEALTHCHECK
app.get("/health", async (req, res) => {
  // si usas mongoose, esto lo veremos desde el modelo
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
    },
  });
});

// routes
app.use("/api/seller", publicSellerRoutes);
app.use("/admin", adminSellerRoutes);

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
