// The shareable story card: a 1080×1920 image (Instagram story size) of the
// coat's journey, in the passport's typography, with its four stamps.
// Loaded on demand, so none of this weighs on the first page load.
import { renderToStaticMarkup } from "react-dom/server";
import { StampArt, STAMPS } from "../components/PassportStamps";
import { STOP_ACCENTS } from "./mapFocus";
import { JOURNEY } from "./passportRecord";
import { GARMENT } from "./garment";

const W = 1080;
const H = 1920;
const PAPER = "#FAF7F2";
const INK = "#2E2925";
const CLAY = "#8A7F76";
const BURGUNDY = "#8E3D52";

// The stamps' ink, mixed toward a dark brown as on the page. Done here in
// plain hex because an SVG drawn as an image can't use CSS color-mix.
function mix(hex: string, toward = "#3B2A22", amount = 0.22): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(hex, i) * (1 - amount) + p(toward, i) * amount));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function stampImage(i: number, label: string): Promise<HTMLImageElement> {
  const svg = renderToStaticMarkup(<StampArt s={STAMPS[i]} color={mix(STOP_ACCENTS[i])} label={label} />)
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"');
  return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

// Letter-spaced text drawn by hand, since canvas letterSpacing isn't
// everywhere yet.
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const total = chars.reduce((w, ch) => w + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = align;
}

// Shrinks a line's font until it fits the given width.
function fitText(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, px: number, max: number) {
  let size = px;
  ctx.font = font(size);
  while (size > 18 && ctx.measureText(text).width > max) ctx.font = font((size -= 2));
}

export type StoryCardText = {
  eyebrow: string;
  route: string;
  stageLabels: string[]; // one per stamp
  ownLine?: string;
  locale: string;
};

type Assets = { text: StoryCardText; logo: HTMLImageElement | null; stamps: HTMLImageElement[] };

async function prepare(text: StoryCardText): Promise<Assets> {
  await Promise.all([
    document.fonts?.load("italic 600 200px 'Cormorant Garamond'"),
    document.fonts?.load("italic 400 60px 'Cormorant Garamond'"),
    document.fonts?.load("500 30px 'Inter'"),
  ]).catch(() => {});
  const logo = await loadImage("/images/wornwith-logo.png").catch(() => null);
  const stamps = await Promise.all(STAMPS.map((_, i) => stampImage(i, text.stageLabels[i])));
  return { text, logo, stamps };
}

// The timeline, in milliseconds: the distance counts up from zero, then the
// four stamps land one after another, then the owner's line fades in, and
// the finished card holds.
const COUNT_FROM = 250;
const COUNT_MS = 2100;
const STAMP_AT = 2550;
const STAMP_GAP = 360;
const STAMP_MS = 420;
const OWN_AT = STAMP_AT + 4 * STAMP_GAP + 150;
export const STORY_CARD_MS = OWN_AT + 2400;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

const CELLS = [
  [W / 2 - 215, 1100],
  [W / 2 + 215, 1130],
  [W / 2 - 205, 1480],
  [W / 2 + 220, 1460],
];

function drawFrame(ctx: CanvasRenderingContext2D, a: Assets, t: number) {
  const { text } = a;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Paper, with the faint ruled lines of a passport page.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(228,224,215,0.55)";
  ctx.lineWidth = 2;
  for (let y = 990; y < 1650; y += 44) {
    ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(W - 90, y); ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Brand.
  ctx.font = "italic 500 54px 'Cormorant Garamond', serif";
  ctx.fillStyle = INK;
  if (a.logo) {
    const lh = 64;
    const lw = (a.logo.width / a.logo.height) * lh;
    const tw = ctx.measureText("wornwith.care").width;
    const x0 = W / 2 - (lw + 18 + tw) / 2;
    ctx.drawImage(a.logo, x0, 150, lw, lh);
    ctx.textAlign = "left";
    ctx.fillText("wornwith.care", x0 + lw + 18, 200);
    ctx.textAlign = "center";
  } else {
    ctx.fillText("wornwith.care", W / 2, 200);
  }

  // The headline number, counting up from zero. Rounded to the nearest 100
  // as it climbs, so the digits tick like an odometer rather than blur.
  ctx.fillStyle = CLAY;
  ctx.font = "500 26px 'Inter', sans-serif";
  spaced(ctx, text.eyebrow.toUpperCase(), W / 2, 420, 9);
  const p = easeOutCubic(clamp01((t - COUNT_FROM) / COUNT_MS));
  const km = p >= 1 ? JOURNEY.distanceKm : Math.round((JOURNEY.distanceKm * p) / 100) * 100;
  ctx.fillStyle = INK;
  ctx.font = "italic 600 210px 'Cormorant Garamond', serif";
  ctx.fillText(`${km.toLocaleString(text.locale)} km`, W / 2, 640);

  // The route, in the coat's own words.
  ctx.fillStyle = BURGUNDY;
  fitText(ctx, text.route, (px) => `italic 400 ${px}px 'Cormorant Garamond', serif`, 50, W - 180);
  ctx.fillText(text.route, W / 2, 770);

  // The four stamps thunk down one by one: from a little larger and turned,
  // to their own angle.
  a.stamps.forEach((img, i) => {
    const k = clamp01((t - (STAMP_AT + i * STAMP_GAP)) / STAMP_MS);
    if (k <= 0) return;
    const [cx, cy] = CELLS[i];
    const scale = 1.35 - 0.35 * easeOutBack(k);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((STAMPS[i].tilt - 6 * (1 - k)) * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.94 * clamp01(k * 1.6);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, -190, -190, 380, 380);
    ctx.restore();
  });

  if (text.ownLine) {
    ctx.globalAlpha = clamp01((t - OWN_AT) / 500);
    ctx.fillStyle = BURGUNDY;
    fitText(ctx, text.ownLine, (px) => `italic 400 ${px}px 'Cormorant Garamond', serif`, 42, W - 180);
    ctx.fillText(text.ownLine, W / 2, 1780);
  }
  ctx.restore();
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  return { canvas, ctx };
}

// The finished card, as a still image.
export async function renderStoryCard(text: StoryCardText): Promise<Blob> {
  const a = await prepare(text);
  const { canvas, ctx } = makeCanvas();
  drawFrame(ctx, a, STORY_CARD_MS);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}

// The moving card: recorded from the canvas as it plays, as MP4 where the
// browser can (Safari, recent Chrome), else WebM. Null if this browser
// can't record video at all, in which case the still image is used.
export function canRecordVideo(): boolean {
  return typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement !== "undefined" && "captureStream" in HTMLCanvasElement.prototype;
}

export async function renderStoryCardVideo(text: StoryCardText): Promise<{ blob: Blob; ext: "mp4" | "webm" } | null> {
  if (!canRecordVideo()) return null;
  const type = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
  if (!type) return null;
  const a = await prepare(text);
  const { canvas, ctx } = makeCanvas();
  drawFrame(ctx, a, 0);
  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise<void>((resolve) => { rec.onstop = () => resolve(); });
  rec.start(250);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = performance.now() - start;
      drawFrame(ctx, a, t);
      if (t < STORY_CARD_MS) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  stream.getTracks().forEach((tr) => tr.stop());
  await done;
  const mime = type.split(";")[0];
  return { blob: new Blob(chunks, { type: mime }), ext: mime === "video/mp4" ? "mp4" : "webm" };
}

export const STORY_CARD_FILENAME = `wornwith-care-${GARMENT.dppId}`;
