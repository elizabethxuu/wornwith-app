// Apple Wallet pass for the coat's passport.
//
// GET /api/pass?check=1           → { ready } (whether the certificates are set)
// GET /api/pass?lang=en&worn=18   → the signed .pkpass file
//
// Inactive until these are set in Vercel (Settings → Environment Variables);
// NATIVE.md explains where each comes from:
//   APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_PASS_CERT, APPLE_PASS_KEY,
//   APPLE_PASS_KEY_PASSPHRASE (if the key has one), APPLE_WWDR_CERT

import { readFileSync } from "node:fs";
import { allowApp } from "./_lib/cors.js";
import { buildPassJson, cleanPassInput, readPassConfig } from "./_lib/passJson.js";

const IMAGES = [
  "icon.png", "icon@2x.png", "icon@3x.png",
  "logo.png", "logo@2x.png", "logo@3x.png",
  "thumbnail.png", "thumbnail@2x.png", "thumbnail@3x.png",
];

let imageCache = null;
function images() {
  if (!imageCache) {
    imageCache = Object.fromEntries(IMAGES.map((name) => [name, readFileSync(new URL(`./_pass/${name}`, import.meta.url))]));
  }
  return imageCache;
}

export default async function handler(req, res) {
  if (allowApp(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cfg = readPassConfig();
  if (req.query?.check) {
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json({ ready: cfg.ready });
    return;
  }
  if (!cfg.ready) {
    res.status(501).json({ error: "Apple Wallet is not configured yet" });
    return;
  }

  try {
    const { PKPass } = await import("passkit-generator");
    const input = cleanPassInput(req.query || {});
    const passJson = buildPassJson(input, cfg);
    const pass = new PKPass(
      { ...images(), "pass.json": Buffer.from(JSON.stringify(passJson)) },
      {
        wwdr: cfg.wwdr,
        signerCert: cfg.signerCert,
        signerKey: cfg.signerKey,
        signerKeyPassphrase: cfg.signerKeyPassphrase,
      },
    );
    const buffer = pass.getAsBuffer();
    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", 'attachment; filename="wornwith-passport.pkpass"');
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buffer);
  } catch (err) {
    console.error("pass error", err);
    res.status(500).json({ error: "Could not make the pass" });
  }
}
