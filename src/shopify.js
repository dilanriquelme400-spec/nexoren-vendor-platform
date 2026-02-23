const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { MongoDBSessionStorage } = require("@shopify/shopify-app-session-storage-mongodb");

// Helpers
function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const shopify = shopifyApi({
  apiKey: mustEnv("SHOPIFY_API_KEY"),
  apiSecretKey: mustEnv("SHOPIFY_API_SECRET"),
  scopes: (process.env.SHOPIFY_SCOPES || "").split(",").map(s => s.trim()).filter(Boolean),
  hostName: mustEnv("SHOPIFY_APP_URL").replace(/^https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  // ONLINE sessions para tener associated_user
  sessionStorage: new MongoDBSessionStorage(mustEnv("MONGO_URL")),
});

function initShopifyAuthRoutes(app) {
  // OAuth start
  app.get("/auth", async (req, res) => {
    try {
      const shop = (req.query.shop || "").toString();
      const allowed = (process.env.SHOPIFY_ALLOWED_SHOP || "").toLowerCase();

      if (!shop) return res.status(400).send("Missing shop");
      if (allowed && shop.toLowerCase() !== allowed) return res.status(403).send("Shop not allowed");

      const redirectUrl = await shopify.auth.begin({
        shop,
        callbackPath: "/auth/callback",
        isOnline: true, // 👈 importantísimo
        rawRequest: req,
        rawResponse: res,
      });

      return res.redirect(redirectUrl);
    } catch (e) {
      console.error(e);
      return res.status(500).send("Auth begin failed");
    }
  });

  // OAuth callback
  app.get("/auth/callback", async (req, res) => {
    try {
      const callback = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      // Guardamos la sesión online en storage
      const session = callback.session;
      // Redirige a tu app root (puedes poner tu UI)
      return res.redirect(`/app?shop=${encodeURIComponent(session.shop)}&host=${encodeURIComponent(req.query.host || "")}`);
    } catch (e) {
      console.error(e);
      return res.status(500).send("Auth callback failed");
    }
  });

  // Endpoint simple para verificar sesión (debug)
  app.get("/api/admin/whoami", async (req, res) => {
    try {
      const session = await getOnlineSessionFromRequest(req);
      if (!session) return res.status(401).json({ ok: false, error: "No session" });

      return res.json({
        ok: true,
        shop: session.shop,
        user: session.onlineAccessInfo?.associated_user || null,
      });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "whoami failed" });
    }
  });
}

// Lee sesión online desde la request
async function getOnlineSessionFromRequest(req) {
  // Shopify manda "shop" y "host" en embedded apps
  const shop = (req.query.shop || req.headers["x-shopify-shop-domain"] || "").toString();
  if (!shop) return null;

  // El session id online: shopify.session.getCurrentId({isOnline:true...})
  const sessionId = await shopify.session.getCurrentId({
    isOnline: true,
    rawRequest: req,
    rawResponse: null,
  });

  if (!sessionId) return null;
  const session = await shopify.sessionStorage.loadSession(sessionId);
  if (!session) return null;

  const allowed = (process.env.SHOPIFY_ALLOWED_SHOP || "").toLowerCase();
  if (allowed && session.shop.toLowerCase() !== allowed) return null;

  return session;
}

module.exports = { shopify, initShopifyAuthRoutes, getOnlineSessionFromRequest };
