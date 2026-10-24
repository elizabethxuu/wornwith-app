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
  coatName: string;
  footer: string;
  locale: string;
};

export async function renderStoryCard(text: StoryCardText): Promise<Blob> {
  await Promise.all([
    document.fonts?.load("italic 600 200px 'Cormorant Garamond'"),
    document.fonts?.load("italic 400 60px 'Cormorant Garamond'"),
    document.fonts?.load("500 30px 'Inter'"),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");

  // Paper, with the faint ruled lines of a passport page.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(228,224,215,0.55)";
  ctx.lineWidth = 2;
  for (let y = 980; y < 1640; y += 44) {
    ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(W - 90, y); ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Brand.
  try {
    const logo = await loadImage("/images/wornwith-logo.png");
    const lh = 64;
    const lw = (logo.width / logo.height) * lh;
    ctx.font = "italic 500 54px 'Cormorant Garamond', serif";
    const tw = ctx.measureText("wornwith.care").width;
    const x0 = W / 2 - (lw + 18 + tw) / 2;
    ctx.drawImage(logo, x0, 150, lw, lh);
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText("wornwith.care", x0 + lw + 18, 200);
    ctx.textAlign = "center";
  } catch {
    ctx.font = "italic 500 54px 'Cormorant Garamond', serif";
    ctx.fillStyle = INK;
    ctx.fillText("wornwith.care", W / 2, 200);
  }

  // The headline number.
  ctx.fillStyle = CLAY;
  ctx.font = "500 26px 'Inter', sans-serif";
  spaced(ctx, text.eyebrow.toUpperCase(), W / 2, 420, 9);
  ctx.fillStyle = INK;
  ctx.font = "italic 600 210px 'Cormorant Garamond', serif";
  ctx.fillText(`${JOURNEY.distanceKm.toLocaleString(text.locale)} km`, W / 2, 640);

  // The route, in the coat's own words.
  ctx.fillStyle = BURGUNDY;
  fitText(ctx, text.route, (px) => `italic 400 ${px}px 'Cormorant Garamond', serif`, 50, W - 180);
  ctx.fillText(text.route, W / 2, 770);

  // The four stamps, each at its own angle, a little overlapping.
  const imgs = await Promise.all(STAMPS.map((_, i) => stampImage(i, text.stageLabels[i])));
  const cells = [
    [W / 2 - 215, 1090],
    [W / 2 + 215, 1120],
    [W / 2 - 205, 1470],
    [W / 2 + 220, 1450],
  ];
  imgs.forEach((img, i) => {
    const [cx, cy] = cells[i];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((STAMPS[i].tilt * Math.PI) / 180);
    ctx.globalAlpha = 0.94;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(img, -190, -190, 380, 380);
    ctx.restore();
  });

  if (text.ownLine) {
    ctx.fillStyle = BURGUNDY;
    fitText(ctx, text.ownLine, (px) => `italic 400 ${px}px 'Cormorant Garamond', serif`, 40, W - 180);
    ctx.fillText(text.ownLine, W / 2, 1715);
  }

  // The coat, and where to find its passport.
  ctx.fillStyle = INK;
  fitText(ctx, text.coatName, (px) => `italic 500 ${px}px 'Cormorant Garamond', serif`, 42, W - 180);
  ctx.fillText(text.coatName, W / 2, 1790);
  ctx.fillStyle = CLAY;
  ctx.font = "500 22px 'Inter', sans-serif";
  spaced(ctx, text.footer.toUpperCase(), W / 2, 1845, 7);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}

export const STORY_CARD_FILENAME = `wornwith-care-${GARMENT.dppId}.png`;
