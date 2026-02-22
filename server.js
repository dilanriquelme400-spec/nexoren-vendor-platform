import express from "express";

const app = express();
app.use(express.json());


// 🟢 ruta principal
app.get("/", (req, res) => {
  res.send("Nexoren Vendor API Running");
});


// 🟢 ruta de prueba
app.get("/ping", (req, res) => {
  res.json({ ok: true, message: "pong" });
});


// 🟢 ruta para recibir datos (la usaremos después)
app.post("/echo", (req, res) => {
  res.json({ received: req.body });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor funcionando en puerto", PORT);
});
