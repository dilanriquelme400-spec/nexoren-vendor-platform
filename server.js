// server.js (simple, sin Express)
const http = require("http");
console.log("MONGODB_URI exists?", !!process.env.MONGODB_URI);
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // ✅ Ruta de prueba
  if (req.method === "GET" && req.url === "/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, message: "pong" }));
  }

  // ✅ Ruta health (por si la necesitas)
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, status: "healthy" }));
  }

  // Página principal
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Nexoren Vendor API Running");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
