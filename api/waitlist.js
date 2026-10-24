// The waitlist at wornwith.care/waitlist.
//
// POST { email, piece, kind, lang } → { ok, already? }
// GET                               → { count, top } (null until there are 10 people)
//
// Stored in Upstash Redis. Inactive until a database is connected: in Vercel,
// Storage → Create Database → Upstash for Redis → connect it to this project,
// which adds KV_REST_API_URL and KV_REST_API_TOKEN by itself.

import { allowApp } from "./_lib/cors.js";
import { cleanSignup, publicStats, redisConfig } from "./_lib/waitlist.js";

async function redis(cfg, commands) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`redis ${r.status}`);
    const out = await r.json();
    return out.map((x) => {
      if (x.error) throw new Error(x.error);
      return x.result;
    });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (allowApp(req, res)) return;
  const cfg = redisConfig();
  if (!cfg) {
    res.status(501).json({ error: "Waitlist not configured" });
    return;
  }

  try {
    if (req.method === "GET") {
      const [count, kinds] = await redis(cfg, [["GET", "wl:count"], ["ZREVRANGE", "wl:kinds", "0", "2", "WITHSCORES"]]);
      res.setHeader("Cache-Control", "public, max-age=60");
      res.status(200).json(publicStats(count, kinds));
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const signup = cleanSignup(body);
    if (!signup.ok) {
      res.status(400).json({ error: signup.error });
      return;
    }

    // A light limit per address: 20 sign-ups an hour.
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    const [hits] = await redis(cfg, [["INCR", `wl:ip:${ip}`], ["EXPIRE", `wl:ip:${ip}`, "3600", "NX"]]);
    if (Number(hits) > 20) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    const record = JSON.stringify({ piece: signup.piece, kind: signup.kind, lang: signup.lang, at: new Date().toISOString() });
    const [added] = await redis(cfg, [["HSETNX", "wl:people", signup.email, record]]);
    if (Number(added) === 1) {
      await redis(cfg, [["INCR", "wl:count"], ["ZINCRBY", "wl:kinds", "1", signup.kind]]);
      res.status(200).json({ ok: true });
    } else {
      res.status(200).json({ ok: true, already: true });
    }
  } catch (err) {
    console.error("waitlist error", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
