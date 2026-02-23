// src/middleware/requireAdmin.js
module.exports = function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res
      .status(500)
      .json({ ok: false, error: "ADMIN_TOKEN no está configurado" });
  }

  // Header recomendado
  const token = req.header("x-admin-token");

  if (!token || token !== expected) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }

  next();
};
