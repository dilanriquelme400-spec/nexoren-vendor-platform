// server.js
const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Healthcheck típico
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, status: "healthy" }));
  }

  // Página simple para ver que está vivo
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <html>
      <head>
        <title>Nexoren Vendor Platform</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          body{font-family:system-ui;background:#0b0b10;color:#f5f5f7;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
          .card{background:rgba(17,17,26,.92);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:22px;max-width:720px;width:92%}
          h1{margin:0 0 8px;font-size:22px}
          p{margin:0;color:rgba(245,245,247,.72)}
          code{display:block;margin-top:14px;padding:12px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:#fff;white-space:pre-wrap}
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Nexoren Vendor Platform está vivo</h1>
          <p>Servidor levantado correctamente en Railway.</p>
          <code>Healthcheck: /health</code>
        </div>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";

const app = express();
app.use(express.json());

// Salud (ya lo tienes)
app.get("/", (req, res) => res.send("Nexoren Vendor API Running"));

// ✅ Prueba de conexión desde el navegador / Shopify
app.get("/ping", (req, res) => {
  res.json({ ok: true, message: "pong", time: new Date().toISOString() });
});

// ✅ Prueba de POST (para cuando mandemos formularios / webhooks)
app.post("/echo", (req, res) => {
  res.json({ ok: true, received: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
