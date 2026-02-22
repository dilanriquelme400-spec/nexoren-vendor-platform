"use strict";

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// --------------------
// Config
// --------------------
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// --------------------
// Mongo connect
// --------------------
let mongoLastError = null;

async function connectMongo() {
  if (!MONGODB_URI) {
    mongoLastError = "Missing env var: MONGODB_URI";
    console.log("❌ Mongo: falta MONGODB_URI (Railway Variables)");
    return;
  }

  try {
    // Si se cae / demora, no bloquea el server eternamente
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });

    console.log("✅ MongoDB conectado");
    mongoLastError = null;
  } catch (err) {
    mongoLastError = err?.message || String(err);
    console.log("❌ Error conectando a MongoDB:", mongoLastError);
  }
}

// Logs de estado
mongoose.connection.on("connected", () => console.log("🟢 Mongoose: connected"));
mongoose.connection.on("disconnected", () => console.log("🟠 Mongoose: disconnected"));
mongoose.connection.on("error", (e) => console.log("🔴 Mongoose error:", e?.message || e));

// --------------------
// Routes
// --------------------
app.get("/", (req, res) => {
  res.type("text").send("✅ Nexoren Vendor Platform está vivo");
});

// Para que Shopify / Railway vea que está vivo
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    mongoConnected: mongoose.connection.readyState === 1,
    mongoLastError: mongoLastError ? "present" : null, // no filtramos detalles aquí
    env: {
      hasMONGODB_URI: Boolean(MONGODB_URI)
    }
  });
});

// Debug rápido (solo dice si existe, no imprime secretos)
app.get("/debug", (req, res) => {
  res.json({
    mongoReadyState: mongoose.connection.readyState,
    hasMONGODB_URI: Boolean(MONGODB_URI)
  });
});

// --------------------
// Start
// --------------------
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
  await connectMongo();
});
