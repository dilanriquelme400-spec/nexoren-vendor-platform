// server.js (root)
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/db");

const publicSellerRoutes = require("./src/routes/publicSeller");
const adminSellerRoutes = require("./src/routes/adminSeller");
const adminPanelRoutes = require("./src/routes/adminPanel"); // ✅ NUEVO

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Nexoren Vendor Platform está vivo ✅ (API)");
});

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
    env: { hasMongoURL: !!process.env.MONGO_URL },
  });
});

// routes
app.use("/api/seller", publicSellerRoutes);
app.use("/admin", adminSellerRoutes);
app.use("/admin", adminPanelRoutes); // ✅ NUEVO: UI

// 404 helper (para entender errores)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
    method: req.method,
  });
});

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
