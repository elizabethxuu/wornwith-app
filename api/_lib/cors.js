// The iPhone app loads the passport from its own bundle (origin
// capacitor://localhost) and calls these functions on wornwith.care. Only
// that origin is allowed across; the website itself is same-origin and
// needs nothing. Returns true when it has fully answered a preflight.
const APP_ORIGINS = new Set(["capacitor://localhost"]);

export function allowApp(req, res) {
  const origin = req.headers?.origin;
  if (origin && APP_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
