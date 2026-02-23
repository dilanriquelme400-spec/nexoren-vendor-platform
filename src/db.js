const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  const url = process.env.MONGO_URL;
  if (!url) {
    console.error("❌ Missing MONGO_URL");
    return;
  }

  if (connected) return;

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 15000,
    });
    connected = true;
    console.log("✅ Mongo connected");
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
  }
}

module.exports = { connectDB };
