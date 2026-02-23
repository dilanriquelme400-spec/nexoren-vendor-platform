/**
 * server.js — Nexoren Vendor Platform (Railway)
 * Requisito: variable de entorno MONGO_URL (solo esta)
 */

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

/* =========================
   Config ENV (SOLO MONGO_URL)
========================= */
const MONGO_URL = (process.env.MONGO_URL || "").trim();
const PORT = process.env.PORT || 3000;

/* =========================
   Estado / Debug
========================= */
let mongoLastError = null;

/* =========================
   Modelo de prueba
========================= */
const DebugPingSchema = new mongoose.Schema(
  {
    source: { type: String, default: "railway-debug" },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "debug_pings" }
);

const DebugPing = mongoose.model("DebugPing", DebugPingSchema);

/* =========================
   Conexión Mongo
========================= */
async function connectMongo() {
  if (!MONGO_URL) {
    mongoLastError = "MONGO_URL missing";
    console.log("❌ Falta variable de entorno MONGO_URL");
    return;
  }

  try {
    // Evita logs ruidosos de mongoose, opcional:
    // mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URL, {
      // estos options son seguros; mongoose ignora algunos en versiones nuevas
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    mongoLastError = null;
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    mongoLastError = err?.message || "Unknown mongo error";
    console.log("❌ Error conectando a MongoDB:", mongoLastError);
  }
}

/* =========================
   Rutas
========================= */

// Home
app.get("/", (req, res) => {
  res.send(`
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto; padding:24px;">
    <h2 style="margin:0 0 6px;">✅ Nexoren Vendor Platform está vivo</h2>
    <div style="opacity:.75;">Servidor levantado correctamente en Railway.</div>
    <div style="margin-top:16px; padding:12px; border:1px solid #333; border-radius:10px; max-width:520px;">
      <div><b>Healthcheck:</b> <code>/health</code></div>
      <div><b>Mongo write test:</b> <code>POST /debug/mongo-write</code></div>
      <div><b>Mongo read test:</b> <code>GET /debug/mongo-read</code></div>
    </div>
  </div>
  `);
});

// Health
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    mongoConnected: mongoose.connection.readyState === 1,
    mongoLastError: mongoLastError,
    env: {
      hasMongoURL: !!MONGO_URL,
    },
  });
});

// Debug: escribir en Mongo
app.post("/debug/mongo-write", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        error: "Mongo not connected",
        mongoLastError,
      });
    }

    const note = typeof req.body?.note === "string" ? req.body.note : "";
    const doc = await DebugPing.create({ note });

    res.json({
      ok: true,
      insertedId: doc._id,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Unknown error",
    });
  }
});

// Debug: leer desde Mongo
app.get("/debug/mongo-read", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        error: "Mongo not connected",
        mongoLastError,
      });
    }

    const docs = await DebugPing.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      ok: true,
      count: docs.length,
      docs,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err?.message || "Unknown error",
    });
  }
});

/* =========================
   Arranque
========================= */
async function start() {
  console.log("🚀 Iniciando servidor...");
  console.log("MONGO_URL existe:", !!MONGO_URL);

  await connectMongo();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server escuchando en puerto ${PORT}`);
  });
}

start();
