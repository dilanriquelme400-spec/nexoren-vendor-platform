const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Railway asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;

// 👇 IMPORTANTE:
// usa MONGODB_URI si existe,
// si no, usa MONGO_URL (tu variable actual)
const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URL;

let mongoLastError = null;

// ========= CONEXIÓN A MONGODB =========
async function conectarMongo() {
  if (!MONGODB_URI) {
    console.log("❌ No se encontró URI de MongoDB");
    mongoLastError = "missing_uri";
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    mongoLastError = error.message;
    console.log("❌ Error conectando Mongo:", error.message);
  }
}

// ========= RUTA PRINCIPAL =========
app.get("/", (req, res) => {
  res.send("Nexoren Vendor Platform está activo 🚀");
});

// ========= HEALTH CHECK =========
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    mongoConnected: mongoose.connection.readyState === 1,
    mongoLastError,
    env: {
      hasMongoURL: Boolean(process.env.MONGO_URL),
      hasMongoURI: Boolean(process.env.MONGODB_URI),
    },
  });
});

// ========= INICIAR SERVIDOR =========
async function iniciar() {
  await conectarMongo();

  app.listen(PORT, () => {
    console.log("🚀 Servidor corriendo en puerto", PORT);
  });
}

iniciar();
