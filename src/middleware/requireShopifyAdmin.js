const { getOnlineSessionFromRequest } = require("../shopify");

async function requireShopifyAdmin(req, res, next) {
  try {
    const session = await getOnlineSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({ ok: false, error: "Unauthorized (no Shopify session)" });
    }

    const user = session.onlineAccessInfo?.associated_user;
    if (!user) {
      return res.status(403).json({ ok: false, error: "Forbidden (no associated user)" });
    }

    // ✅ Sólo el dueño de la cuenta (admin real)
    if (user.account_owner !== true) {
      return res.status(403).json({ ok: false, error: "Forbidden (not account owner)" });
    }

    req.shopifySession = session;
    req.shopifyUser = user;
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Auth middleware error" });
  }
}

module.exports = { requireShopifyAdmin };
