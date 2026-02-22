const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.get("/", (req, res) => {
  res.send("Nexoren Vendor Platform ONLINE ✅");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    mongoConnected: mongoose.connection.readyState === 1,
    using: "NEW_SERVER_JS_v2"
  });
});

async function start() {
  const uri = process.env.MONGODB_URI;

  console.log("BOOT: NEW_SERVER_JS_v2");
  console.log("MONGODB_URI exists:", !!uri);

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log("✅ Mongo connected");
    } catch (e) {
      console.log("❌ Mongo connect error:", e.message);
    }
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Listening on", port));
}

start();
