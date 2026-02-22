const express = require("express");
const app = express();

app.use(express.json());

// HOME
app.get("/", (req, res) => {
  res.send("Nexoren Vendor Platform running ✅");
});

// Shopify test route
app.get("/auth", (req, res) => {
  res.send("Auth route ready");
});

// Callback route
app.get("/auth/callback", (req, res) => {
  res.send("Callback received");
});

// Vendor API test
app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
