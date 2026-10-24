// What a scanned tag means for this passport. The coat's tag carries the
// passport link, e.g. https://wornwith.care/en?dpp=4f2a. Pure, so it can be
// tested without a phone.

export type TagVerdict =
  | { state: "match" }
  | { state: "other"; dpp: string }
  | { state: "no-passport" };

export function classifyTag(urls: string[], texts: string[], expectedDpp: string): TagVerdict {
  for (const raw of urls) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      continue;
    }
    if (!/(^|\.)wornwith\.care$/i.test(url.hostname)) continue;
    const dpp = url.searchParams.get("dpp");
    if (!dpp) continue;
    return dpp === expectedDpp ? { state: "match" } : { state: "other", dpp };
  }
  for (const text of texts) {
    const t = text.trim();
    if (t === expectedDpp) return { state: "match" };
  }
  return { state: "no-passport" };
}
