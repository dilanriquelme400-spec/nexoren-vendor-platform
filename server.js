const express = require("express");
const mongoose = require("mongoose");

const app = express();

console.log("Servidor iniciando...");
console.log("Mongo URI existe:", !!process.env.MONGODB_URI);

// página principal
app.get("/", (req, res) => {
  res.send("Nexoren Vendor Platform está activo");
});

// estado del servidor
app.get("/health", (req, res) => {
  res.json({
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// conectar a MongoDB
async function conectarMongo() {
  if (!process.env.MONGODB_URI) {
    console.log("⚠️ No se encontró MONGODB_URI");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.log("❌ Error conectando Mongo:", error.message);
  }
}

async function iniciar() {
  await conectarMongo();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
  });
}

iniciar();
