// The waitlist's rules, kept pure so they can be tested on their own.

export const KINDS = ["coat", "leather", "dress", "knit", "denim", "other"];

// The count and the most-named piece stay private until there are enough
// people for them to mean something.
export const PUBLIC_FROM = 10;

export function cleanSignup(body = {}) {
  const email = String(body.email ?? "").trim().toLowerCase();
  const piece = String(body.piece ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const kind = KINDS.includes(body.kind) ? body.kind : "other";
  const lang = ["en", "fr", "pt"].includes(body.lang) ? body.lang : "en";
  // Deliberately simple: one @, something on each side, a dot in the domain.
  const emailOk = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!emailOk) return { ok: false, error: "email" };
  if (!piece) return { ok: false, error: "piece" };
  return { ok: true, email, piece, kind, lang };
}

// Turns the stored count and per-kind tallies into what the page may show.
// kinds is Upstash's ZREVRANGE … WITHSCORES reply: [member, score, …].
export function publicStats(count, kinds = []) {
  const n = Number(count) || 0;
  if (n < PUBLIC_FROM) return { count: null, top: null };
  let top = null;
  for (let i = 0; i < kinds.length; i += 2) {
    if (kinds[i] !== "other" && KINDS.includes(kinds[i])) { top = kinds[i]; break; }
  }
  return { count: n, top };
}

export function redisConfig(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || null;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || null;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}
