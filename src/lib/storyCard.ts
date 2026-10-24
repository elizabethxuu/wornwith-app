// The story card: one 1080 × 1920 image of the coat's life, sized for an
// Instagram Story. It is drawn on a canvas from the same facts the passport
// shows (journey, materials, impact) plus the owner's own wear count, so the
// card and the passport can never disagree.

import { GARMENT } from "./garment";
import { IMPACT, JOURNEY, PASSPORT_ID } from "./passportRecord";
import { loadOwnershipRecord } from "./persistence";
import type { Lang } from "./langUrl";

// The card's own words, loaded only when a card is made.
const CARD = {
  lc_eyebrow: { en: "MY COAT'S LIFE", fr: "LA VIE DE MON MANTEAU", pt: "A VIDA DO MEU CASACO" },
  lc_headline: { en: "It travelled further than I did this year.", fr: "Il a voyagé plus loin que moi cette année.", pt: "Viajou mais do que eu este ano." },
  lc_km: { en: "kilometres before it reached me", fr: "kilomètres avant d'arriver jusqu'à moi", pt: "quilómetros antes de chegar até mim" },
  lc_grown: { en: "GROWN", fr: "ÉLEVÉE", pt: "CRIADA" },
  lc_spun: { en: "SPUN", fr: "FILÉE", pt: "FIADA" },
  lc_sewn: { en: "SEWN", fr: "COUSU", pt: "COSIDO" },
  lc_mine: { en: "MINE", fr: "À MOI", pt: "MEU" },
  lc_worn: { en: "times worn", fr: "fois porté", pt: "vezes usado" },
  lc_recycled: { en: "recycled wool", fr: "laine recyclée", pt: "lã reciclada" },
  lc_co2: { en: "CO₂ saved", fr: "CO₂ évité", pt: "CO₂ poupado" },
  lc_since: { en: "Mine since {date}", fr: "À moi depuis {date}", pt: "Meu desde {date}" },
  lc_tap: { en: "Tap the tag ›", fr: "Touchez l'étiquette ›", pt: "Toque na etiqueta ›" },
} as const;
type CardKey = keyof typeof CARD;

const W = 1080;
const H = 1920;
const S = 2; // drawn at twice the 540 × 960 design size

const INK = "#2E2925";
const MUTED = "#6F665F";
const LINE = "#E8E2DB";
const GROUND = "#FBF9F6";
const ACCENT = "#8E3D52";
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';

const LOCALE: Record<Lang, string> = { en: "en-US", fr: "fr-FR", pt: "pt-BR" };

const STOPS = [
  { city: "Canterbury", place: "NZ", stage: "lc_grown" as CardKey, dot: "#3F6B4A" },
  { city: "Biella", place: "ITALIA", stage: "lc_spun" as CardKey, dot: "#9A6A1E" },
  { city: "Porto", place: "PORTUGAL", stage: "lc_sewn" as CardKey, dot: "#2F5A7A" },
  { city: "Paris", place: "FRANCE", stage: "lc_mine" as CardKey, dot: ACCENT },
];

export function wearCount(): number {
  const n = parseInt(String(loadOwnershipRecord().wearCount || GARMENT.timesWorn).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fontsReady() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load(`500 40px ${SERIF}`),
    document.fonts.load(`600 40px ${SERIF}`),
    document.fonts.load(`italic 500 40px ${SERIF}`),
    document.fonts.load(`400 20px ${SANS}`),
    document.fonts.load(`500 20px ${SANS}`),
    document.fonts.load(`600 20px ${SANS}`),
  ]).catch(() => undefined);
}

// Letter-spaced text, drawn a character at a time (canvas letterSpacing is
// not available in every Safari the app runs in).
function tracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "right" = "left") {
  const chars = [...text];
  const width = chars.reduce((w, c) => w + ctx.measureText(c).width, 0) + spacing * (chars.length - 1);
  let cx = align === "right" ? x - width : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  }
  ctx.textAlign = prev;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawStoryCard(lang: Lang): Promise<HTMLCanvasElement> {
  const t = (k: CardKey) => CARD[k][lang];
  await fontsReady();
  const [coat, logo] = await Promise.all([
    loadImage(GARMENT.image),
    loadImage("/images/wornwith-logo-sm.webp").catch(() => null),
  ]);
  const num = new Intl.NumberFormat(LOCALE[lang]);
  const since = new Intl.DateTimeFormat(LOCALE[lang], { month: "long", year: "numeric" }).format(GARMENT.ownedSinceDate);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S); // from here on, coordinates are in the 540 × 960 design
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, 540, 960);

  const L = 40;
  const R = 500;

  // Header: logo and wordmark, the year on the right.
  let x = L;
  if (logo) {
    const h = 26;
    const w = (logo.naturalWidth / logo.naturalHeight) * h;
    ctx.drawImage(logo, L, 44, w, h);
    x = L + w + 10;
  }
  ctx.fillStyle = INK;
  ctx.font = `italic 500 22px ${SERIF}`;
  ctx.fillText("wornwith.care", x, 64);
  ctx.fillStyle = MUTED;
  ctx.font = `500 10px ${SANS}`;
  tracked(ctx, String(new Date().getFullYear()), R, 62, 2.2, "right");

  // Eyebrow and headline.
  ctx.fillStyle = ACCENT;
  ctx.font = `600 11px ${SANS}`;
  tracked(ctx, t("lc_eyebrow"), L, 140, 2.9);
  ctx.fillStyle = INK;
  ctx.font = `italic 500 44px ${SERIF}`;
  let y = 188;
  for (const line of wrap(ctx, t("lc_headline"), R - L)) {
    ctx.fillText(line, L, y);
    y += 46;
  }

  // The distance, with the coat beside it in a rounded tile.
  const tileW = 168;
  const tileH = 214;
  const top = y - 10;
  const tx = R - tileW;
  ctx.save();
  roundRect(ctx, tx, top, tileW, tileH, 16);
  ctx.clip();
  const scale = Math.max(tileW / coat.naturalWidth, tileH / coat.naturalHeight);
  const dw = coat.naturalWidth * scale;
  const dh = coat.naturalHeight * scale;
  ctx.drawImage(coat, tx + (tileW - dw) / 2, top + (tileH - dh) / 2, dw, dh);
  ctx.restore();
  const kmBase = top + tileH - 46;
  ctx.fillStyle = INK;
  ctx.font = `600 92px ${SERIF}`;
  ctx.fillText(num.format(JOURNEY.distanceKm), L - 2, kmBase);
  ctx.fillStyle = MUTED;
  ctx.font = `400 13px ${SANS}`;
  ctx.fillText(t("lc_km"), L, top + tileH - 4);

  // The route.
  y = top + tileH + 30;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(L, y);
  ctx.lineTo(R, y);
  ctx.stroke();
  y += 44;
  for (const s of STOPS) {
    ctx.fillStyle = s.dot;
    ctx.beginPath();
    ctx.arc(L + 11, y - 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `italic 500 22px ${SERIF}`;
    ctx.fillText(s.city, L + 34, y);
    ctx.fillStyle = MUTED;
    ctx.font = `400 11px ${SANS}`;
    tracked(ctx, `${t(s.stage)} · ${s.place}`, R, y - 2, 1.5, "right");
    y += 42;
  }

  // Three numbers.
  y += 4;
  const boxH = 88;
  const colW = (R - L) / 3;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, L, y, R - L, boxH, 14);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(L + colW, y);
  ctx.lineTo(L + colW, y + boxH);
  ctx.moveTo(L + colW * 2, y);
  ctx.lineTo(L + colW * 2, y + boxH);
  ctx.stroke();
  const worn = wearCount();
  const stats: [string, string, string][] = [
    [worn ? num.format(worn) : "—", "", t("lc_worn")],
    ["70%", "", t("lc_recycled")],
    [num.format(IMPACT.co2SavedKg), " kg", t("lc_co2")],
  ];
  stats.forEach(([big, unit, label], i) => {
    const cx = L + colW * i + 14;
    ctx.fillStyle = INK;
    ctx.font = `600 34px ${SERIF}`;
    ctx.fillText(big, cx, y + 47);
    if (unit) {
      const bw = ctx.measureText(big).width;
      ctx.font = `600 18px ${SERIF}`;
      ctx.fillText(unit, cx + bw, y + 47);
    }
    ctx.fillStyle = MUTED;
    ctx.font = `400 11px ${SANS}`;
    ctx.fillText(label, cx, y + 70);
  });

  // Footer: the coat, since when, the passport, and the call to tap.
  ctx.fillStyle = INK;
  ctx.font = `600 12px ${SANS}`;
  ctx.fillText(GARMENT.name, L, 900);
  ctx.fillStyle = MUTED;
  ctx.font = `400 11px ${SANS}`;
  ctx.fillText(`${t("lc_since").replace("{date}", since)} · ${PASSPORT_ID}`, L, 920);
  ctx.fillStyle = ACCENT;
  ctx.font = `italic 500 18px ${SERIF}`;
  ctx.textAlign = "right";
  ctx.fillText(t("lc_tap"), R, 918);
  ctx.textAlign = "left";

  return canvas;
}

export async function makeStoryCard(lang: Lang): Promise<{ blob: Blob; url: string; file: File }> {
  const canvas = await drawStoryCard(lang);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
  const file = new File([blob], "wornwith-story-card.png", { type: "image/png" });
  return { blob, url: URL.createObjectURL(blob), file };
}
