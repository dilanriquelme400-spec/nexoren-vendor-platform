require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB } = require("./src/db");
const { initShopifyAuthRoutes } = require("./src/shopify");

const publicApplyRouter = require("./src/routes/publicApply");
const adminSellerRouter = require("./src/routes/adminSeller");

const app = express();

// Seguridad base
app.use(helmet());

// CORS: tu storefront + Shopify admin (por si pegas panel embebido)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Logs
app.use(morgan("dev"));

// JSON (para rutas admin)
app.use(express.json({ limit: "2mb" }));

// Conexión DB
connectDB();

// Shopify OAuth routes + session middleware
initShopifyAuthRoutes(app);

// Health
app.get("/", (req, res) => {
  res.json({ ok: true, app: "nexoren", status: "running" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, status: "healthy" });
});

// Rutas
app.use("/api/seller", publicApplyRouter);
app.use("/api/admin", adminSellerRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

// Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
