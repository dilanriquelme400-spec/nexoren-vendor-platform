/**
 * Nexoren Vendor Platform - Backend (Railway)
 * - Healthcheck: GET /health
 * - Upload + create application (multipart): POST /api/applications
 * - List applications (admin): GET /admin/applications
 * - Update status (admin): PATCH /admin/applications/:id
 *
 * ENV:
 *  - MONGO_URL
 *  - CLOUDINARY_CLOUD_NAME
 *  - CLOUDINARY_API_KEY
 *  - CLOUDINARY_API_SECRET
 *  - ADMIN_TOKEN
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();

// ---------- basic middleware ----------
app.use(cors()); // luego lo restringimos a tu dominio
app.use(express.json({ limit: "1mb" }));

// ---------- env helpers ----------
const PORT = process.env.PORT || 3000;

const MONGO_URL = process.env.MONGO_URL || "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// ---------- cloudinary config ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
});

// ---------- mongo ----------
let mongoLastError = null;

async function connectMongo() {
  if (!MONGO_URL) {
    mongoLastError = "Missing MONGO_URL";
    console.log("❌ Missing MONGO_URL");
    return;
  }
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 10000
    });
    mongoLastError = null;
    console.log("✅ MongoDB connected");
  } catch (err) {
    mongoLastError = err?.message || String(err);
    console.log("❌ Mongo connect error:", mongoLastError);
  }
}

const ApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    storeName: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },

    // links cloudinary
    files: {
      idFrontUrl: { type: String, default: "" },
      idBackUrl: { type: String, default: "" },
      selfieUrl: { type: String, default: "" }
    },

    status: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected"],
      default: "pending"
    },

    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);

// ---------- upload (multer memory) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024 // 8MB
  }
});

async function uploadToCloudinary(buffer, originalName, folder) {
  // Cloudinary upload from memory buffer
  // returns secure_url
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${sanitizeName(originalName)}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );
    stream.end(buffer);
  });
}

function sanitizeName(name) {
  return String(name || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-_\.]/g, "-")
    .slice(0, 80);
}

// ---------- routes ----------
app.get("/", (req, res) => {
  res.type("html").send(`
    <div style="font-family:system-ui;padding:24px">
      <h2>✅ Nexoren Vendor Platform está vivo</h2>
      <p>Servidor levantado correctamente en Railway.</p>
      <div style="margin-top:14px;padding:12px;border:1px solid #ddd;border-radius:10px;max-width:520px">
        <div><b>Healthcheck:</b> <code>/health</code></div>
        <div><b>Create application:</b> <code>POST /api/applications</code> (multipart)</div>
      </div>
    </div>
  `);
});

app.get("/health", (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    status: "healthy",
    mongoConnected,
    mongoLastError: mongoLastError,
    env: {
      hasMongoURL: !!process.env.MONGO_URL,
      hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY
    }
  });
});

/**
 * Create application + upload 3 files
 * multipart/form-data fields:
 *  - fullName, email, storeName, phone, country, address
 * files:
 *  - idFront, idBack, selfie
 */
app.post(
  "/api/applications",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // basic validation
      const fullName = (req.body.fullName || "").trim();
      const email = (req.body.email || "").trim().toLowerCase();
      const storeName = (req.body.storeName || "").trim();
      const phone = (req.body.phone || "").trim();
      const country = (req.body.country || "").trim();
      const address = (req.body.address || "").trim();

      if (!fullName || !email || !storeName || !phone || !country || !address) {
        return res.status(400).json({ ok: false, error: "Missing required fields" });
      }

      // ensure mongo
      if (mongoose.connection.readyState !== 1) {
        await connectMongo();
      }
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ ok: false, error: "MongoDB not connected" });
      }

      // upload files
      const folder = `nexoren/vendor-applications/${email}`;
      const files = req.files || {};

      const idFrontFile = files.idFront?.[0];
      const idBackFile = files.idBack?.[0];
      const selfieFile = files.selfie?.[0];

      if (!idFrontFile || !idBackFile || !selfieFile) {
        return res.status(400).json({ ok: false, error: "Missing required files (idFront, idBack, selfie)" });
      }

      const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(idFrontFile.buffer, idFrontFile.originalname, folder),
        uploadToCloudinary(idBackFile.buffer, idBackFile.originalname, folder),
        uploadToCloudinary(selfieFile.buffer, selfieFile.originalname, folder)
      ]);

      // save in mongo
      const doc = await Application.create({
        fullName,
        email,
        storeName,
        phone,
        country,
        address,
        files: { idFrontUrl, idBackUrl, selfieUrl },
        status: "pending"
      });

      return res.json({ ok: true, id: String(doc._id), status: doc.status });
    } catch (err) {
      console.log("❌ /api/applications error:", err?.message || err);
      return res.status(500).json({ ok: false, error: "Server error" });
    }
  }
);

// ---------- simple admin auth ----------
function requireAdmin(req, res, next) {
  const token = (req.headers["x-admin-token"] || "").toString();
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

// list applications
app.get("/admin/applications", requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status || "").toString();
    const q = status ? { status } : {};
    const list = await Application.find(q).sort({ createdAt: -1 }).limit(200);
    res.json({ ok: true, items: list });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// update status
app.patch("/admin/applications/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const status = (req.body.status || "").toString();
    const notes = (req.body.notes || "").toString();

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status" });
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });

    res.json({ ok: true, item: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ---------- start ----------
async function start() {
  await connectMongo();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

start();
