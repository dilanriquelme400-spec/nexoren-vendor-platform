const express = require("express");
const cors = require("cors");
const connectDB = require("./src/db");

const adminSellerRoutes = require("./src/routes/adminSeller");

const app = express();

app.use(cors());
app.use(express.json());

// conectar base de datos
connectDB();

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// rutas admin (protegidas)
app.use("/admin/sellers", adminSellerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
