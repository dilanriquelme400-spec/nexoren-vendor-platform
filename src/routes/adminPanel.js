// src/routes/adminPanel.js
const express = require("express");
const SellerApplication = require("../models/SellerApplication");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

/**
 * Panel HTML: GET /admin/panel
 * Requiere header: x-admin-token
 */
router.get("/panel", requireAdmin, async (req, res) => {
  // HTML simple: lista + modal detalle
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nexoren • Admin Seller Panel</title>
  <style>
    :root{
      --bg:#0F0F14;
      --card:#11111A;
      --border:#232338;
      --text:#F5F5F7;
      --muted:rgba(245,245,247,.72);
      --primary:#5B2EFF;
      --danger:#ff4d6d;
      --ok:#2ecc71;
      --shadow:0 18px 60px rgba(0,0,0,.55);
    }
    *{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;}
    body{margin:0;background:linear-gradient(180deg,var(--bg),#0b0b10);color:var(--text);}
    .wrap{max-width:1100px;margin:0 auto;padding:28px 16px 60px;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px;}
    h1{margin:0;font-size:28px;letter-spacing:-.02em;}
    .sub{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
    .card{background:rgba(17,17,26,.92);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);overflow:hidden;}
    .bar{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:14px 14px;border-bottom:1px solid var(--border);background:rgba(20,20,32,.6);}
    .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
    .input{
      background:#141420;border:1px solid var(--border);color:var(--text);
      border-radius:12px;padding:10px 12px;outline:none;min-width:220px;
    }
    .btn{
      border-radius:12px;padding:10px 12px;border:1px solid var(--border);
      background:transparent;color:var(--text);cursor:pointer;font-weight:800;
    }
    .btn:hover{background:rgba(245,245,247,.06);}
    .btn.primary{background:var(--primary);border-color:rgba(91,46,255,.65);}
    .btn.primary:hover{filter:brightness(1.05);}
    .pill{padding:6px 10px;border-radius:999px;border:1px solid var(--border);font-size:12px;color:var(--muted)}
    table{width:100%;border-collapse:collapse;}
    th,td{padding:12px 14px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:top;}
    th{color:rgba(245,245,247,.8);text-align:left;background:rgba(20,20,32,.35);}
    tr:hover td{background:rgba(245,245,247,.03);}
    .status{font-weight:900}
    .status.pending{color:#f1c40f}
    .status.approved{color:var(--ok)}
    .status.rejected{color:var(--danger)}
    .status.missing_docs{color:#e67e22}
    .link{color:rgba(245,245,247,.9);text-decoration:underline;cursor:pointer;font-weight:800}
    .muted{color:var(--muted)}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .imgbox{border:1px solid var(--border);border-radius:14px;background:rgba(20,20,32,.6);padding:10px}
    .imgbox img{width:100%;border-radius:12px;display:block}
    .modal{
      position:fixed;inset:0;display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.65);padding:16px;z-index:50;
    }
    .modal.open{display:flex}
    .modal-card{
      width:min(980px,100%);max-height:88vh;overflow:auto;
      background:rgba(17,17,26,.98);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);
    }
    .modal-head{padding:14px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:10px;align-items:flex-start;background:rgba(20,20,32,.6)}
    .modal-title{margin:0;font-size:18px}
    .modal-body{padding:14px}
    .kv{display:grid;grid-template-columns:180px 1fr;gap:8px 12px;margin:12px 0}
    .k{color:rgba(245,245,247,.7);font-weight:800}
    .v{color:rgba(245,245,247,.92)}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
    .btn.danger{border-color:rgba(255,77,109,.45);background:rgba(255,77,109,.08)}
    .btn.ok{border-color:rgba(46,204,113,.35);background:rgba(46,204,113,.10)}
    .toast{
      position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
      background:rgba(20,20,32,.92);border:1px solid var(--border);border-radius:14px;
      padding:10px 12px;color:var(--text);display:none;z-index:60;
    }
    .toast.show{display:block}
    @media(max-width: 820px){ .grid2{grid-template-columns:1fr} .kv{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <h1>Admin Seller Panel</h1>
        <div class="sub">Ver y moderar solicitudes de seller (solo admin token).</div>
      </div>
      <div class="pill" id="pillState">No cargado</div>
    </div>

    <div class="card">
      <div class="bar">
        <div class="row">
          <input class="input" id="adminToken" placeholder="x-admin-token" />
          <select class="input" id="statusFilter" style="min-width:180px">
            <option value="">Todos</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="missing_docs">missing_docs</option>
          </select>
          <button class="btn primary" id="btnLoad">Cargar</button>
        </div>
        <div class="row">
          <span class="muted" id="count"></span>
        </div>
      </div>

      <div style="overflow:auto">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tienda</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody id="tbody">
            <tr><td colspan="6" class="muted">Clic en “Cargar”.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="modal" id="modal">
    <div class="modal-card">
      <div class="modal-head">
        <div>
          <h2 class="modal-title" id="mTitle">Solicitud</h2>
          <div class="muted" id="mSub"></div>
        </div>
        <button class="btn" id="mClose">Cerrar</button>
      </div>
      <div class="modal-body">
        <div class="kv" id="kv"></div>

        <div class="grid2" id="imgs"></div>

        <div class="actions">
          <button class="btn ok" id="btnApprove">✅ Aprobar</button>
          <button class="btn danger" id="btnReject">❌ Rechazar</button>
          <button class="btn" id="btnRefreshOne">🔄 Recargar</button>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

<script>
  const API_BASE = location.origin;
  const tbody = document.getElementById("tbody");
  const countEl = document.getElementById("count");
  const tokenEl = document.getElementById("adminToken");
  const statusEl = document.getElementById("statusFilter");
  const pill = document.getElementById("pillState");

  const modal = document.getElementById("modal");
  const mClose = document.getElementById("mClose");
  const mTitle = document.getElementById("mTitle");
  const mSub = document.getElementById("mSub");
  const kv = document.getElementById("kv");
  const imgs = document.getElementById("imgs");
  const toast = document.getElementById("toast");

  const btnLoad = document.getElementById("btnLoad");
  const btnApprove = document.getElementById("btnApprove");
  const btnReject = document.getElementById("btnReject");
  const btnRefreshOne = document.getElementById("btnRefreshOne");

  let currentId = null;

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"), 2200);
  }

  function esc(s){ return String(s ?? ""); }

  function fmtDate(iso){
    if(!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString();
  }

  function statusClass(st){
    if(st === "approved") return "approved";
    if(st === "rejected") return "rejected";
    if(st === "missing_docs") return "missing_docs";
    return "pending";
  }

  async function api(path, opts = {}){
    const token = tokenEl.value.trim();
    const headers = Object.assign({}, opts.headers || {});
    if(token) headers["x-admin-token"] = token;
    const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
    const data = await res.json().catch(()=>({ ok:false, error:"Bad JSON" }));
    if(!res.ok) throw new Error(data?.error || ("HTTP " + res.status));
    return data;
  }

  function setPill(text, ok){
    pill.textContent = text;
    pill.style.borderColor = ok ? "rgba(46,204,113,.35)" : "rgba(255,77,109,.35)";
    pill.style.background = ok ? "rgba(46,204,113,.10)" : "rgba(255,77,109,.10)";
  }

  async function loadList(){
    tbody.innerHTML = '<tr><td colspan="6" class="muted">Cargando...</td></tr>';
    try{
      const status = statusEl.value;
      const q = status ? ("?status=" + encodeURIComponent(status)) : "";
      const data = await api("/admin/sellers" + q);
      const rows = data.rows || [];
      countEl.textContent = "Total: " + rows.length;
      setPill("Autorizado ✅", true);

      if(!rows.length){
        tbody.innerHTML = '<tr><td colspan="6" class="muted">No hay solicitudes.</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map(r => {
        return \`
          <tr>
            <td>\${fmtDate(r.createdAt)}</td>
            <td>\${esc(r.fullName)}</td>
            <td>\${esc(r.email)}</td>
            <td>\${esc(r.storeName)}</td>
            <td><span class="status \${statusClass(r.status)}">\${esc(r.status)}</span></td>
            <td><span class="link" data-open="\${r._id}">Ver</span></td>
          </tr>
        \`;
      }).join("");

    }catch(e){
      setPill("No autorizado ❌", false);
      tbody.innerHTML = '<tr><td colspan="6" class="muted">Error: ' + esc(e.message) + '</td></tr>';
      showToast("Error: " + e.message);
    }
  }

  async function openOne(id){
    currentId = id;
    modal.classList.add("open");
    kv.innerHTML = '<div class="muted">Cargando...</div>';
    imgs.innerHTML = "";
    try{
      const data = await api("/admin/sellers/" + id);
      const r = data.row;

      mTitle.textContent = "Solicitud: " + (r.storeName || r.fullName || r._id);
      mSub.textContent = "Estado: " + r.status + " • " + fmtDate(r.createdAt);

      const pairs = [
        ["ID", r._id],
        ["Nombre", r.fullName],
        ["Email", r.email],
        ["Tienda", r.storeName],
        ["Teléfono", r.phone],
        ["País", r.country],
        ["Dirección", r.address],
        ["Estado", r.status],
      ];

      kv.innerHTML = pairs.map(([k,v]) => \`
        <div class="k">\${esc(k)}</div>
        <div class="v">\${esc(v || "-")}</div>
      \`).join("");

      const pics = [
        ["ID Front", r.idFrontUrl],
        ["ID Back", r.idBackUrl],
        ["Selfie", r.selfieUrl],
      ].filter(x => !!x[1]);

      imgs.innerHTML = (pics.length ? pics : [["Sin imágenes", null]]).map(([label, url]) => {
        if(!url){
          return \`<div class="imgbox"><div class="muted">No hay imágenes en esta solicitud.</div></div>\`;
        }
        const safe = esc(url);
        return \`
          <div class="imgbox">
            <div class="muted" style="margin-bottom:8px;font-weight:800">\${esc(label)}</div>
            <a class="link" href="\${safe}" target="_blank" rel="noreferrer">Abrir en pestaña</a>
            <div style="height:10px"></div>
            <img src="\${safe}" alt="\${esc(label)}" />
          </div>
        \`;
      }).join("");

    }catch(e){
      kv.innerHTML = '<div class="muted">Error: ' + esc(e.message) + '</div>';
      showToast("Error: " + e.message);
    }
  }

  async function approve(){
    if(!currentId) return;
    try{
      const data = await api("/admin/sellers/" + currentId + "/approve", { method:"POST" });
      showToast("Aprobado ✅");
      await openOne(currentId);
      await loadList();
    }catch(e){
      showToast("Error: " + e.message);
    }
  }

  async function reject(){
    if(!currentId) return;
    try{
      const data = await api("/admin/sellers/" + currentId + "/reject", { method:"POST" });
      showToast("Rechazado ❌");
      await openOne(currentId);
      await loadList();
    }catch(e){
      showToast("Error: " + e.message);
    }
  }

  btnLoad.addEventListener("click", loadList);

  tbody.addEventListener("click", (e) => {
    const id = e.target?.getAttribute?.("data-open");
    if(id) openOne(id);
  });

  mClose.addEventListener("click", ()=> modal.classList.remove("open"));
  modal.addEventListener("click", (e)=> { if(e.target === modal) modal.classList.remove("open"); });

  btnApprove.addEventListener("click", approve);
  btnReject.addEventListener("click", reject);
  btnRefreshOne.addEventListener("click", ()=> currentId && openOne(currentId));
</script>
</body>
</html>
  `);
});

module.exports = router;
