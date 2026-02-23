// src/db.js
const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL no está configurada en Railway Variables");
  }

  // Evita logs raros y reconexiones agresivas
  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log("✅ MongoDB connected");
};
