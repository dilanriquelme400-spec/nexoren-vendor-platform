// src/cloudinary.js — REEMPLAZA TODO EL ARCHIVO COMPLETO CON ESTO
const cloudinary = require("cloudinary").v2;

let isConfigured = false;

function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn("⚠️ Cloudinary env vars missing. Uploads will fail.");
    return false;
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }

  return true;
}

/**
 * Subir un buffer (multer memory) por stream
 * - resourceType: "image" | "raw" | "video" | "auto"
 */
async function uploadBufferToCloudinary({ buffer, folder, publicId, resourceType }) {
  const ok = initCloudinary();
  if (!ok) {
    throw new Error("Cloudinary not configured");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "seller-applications",
        public_id: publicId,
        resource_type: resourceType || "auto",
        overwrite: true,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format,
          originalFilename: result.original_filename,
        });
      }
    );

    stream.end(buffer);
  });
}

module.exports = { initCloudinary, uploadBufferToCloudinary };
