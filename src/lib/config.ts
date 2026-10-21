// Update this if you deploy to a different domain or want to test against
// a Vercel preview URL before pointing the real tag at production.
export const SITE_URL = "https://wornwith.care";

// Canonical link to the interactive passport: current origin (so previews
// and production both work), language path, and the garment ID. Never carries
// ?mode=, so a shared link or QR always opens the passport, not the deck.
export function passportUrl(lang: string, dppId: string, origin?: string): string {
  const base = (origin && /^https?:\/\//.test(origin) ? origin : SITE_URL).replace(/\/+$/, "");
  return `${base}/${lang}?dpp=${encodeURIComponent(dppId)}`;
}

// Optional: paste a Formspree endpoint here (free at formspree.io, create
// a form, copy the endpoint URL, e.g. "https://formspree.io/f/abcd1234")
// to actually receive what visitors type on Personalize and My Wardrobe in
// your own inbox/dashboard. Leave blank and this is skipped entirely, the
// data still saves locally in the visitor's browser either way.
export const FORMSPREE_ENDPOINT = "";
