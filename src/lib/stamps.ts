import { haptic } from "./touches";

// Passport stamps, the hidden last page. A stamp is collected the first
// time its stop is opened (on the Journey timeline, the Story map, or a
// country chip). Kept in the visitor's own browser; if storage is blocked
// the stamps simply don't persist between visits.

const KEY = "wornwith:COS-8821-4f2a:stamps";
const CHANGED = "wwc:stamps-changed";
export const OPEN = "wwc:open-stamps";
export const STAMP_COUNT = 4;

function read(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < STAMP_COUNT) : [];
  } catch {
    return [];
  }
}

let memory: number[] | null = null;

export function collectedStamps(): number[] {
  if (memory === null) memory = read();
  return memory;
}

export function collectStamp(index: number) {
  const now = collectedStamps();
  if (now.includes(index) || index < 0 || index >= STAMP_COUNT) return;
  memory = [...now, index].sort();
  // Collected by a tap (not the default stop shown on arrival): a small tick.
  if (now.length > 0 || index !== STAMP_COUNT - 1) haptic(8);
  try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch { /* storage blocked */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGED));
}

export function onStampsChanged(fn: () => void): () => void {
  window.addEventListener(CHANGED, fn);
  return () => window.removeEventListener(CHANGED, fn);
}

export function openStampsPage() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(OPEN));
}

export function onOpenStampsPage(fn: () => void): () => void {
  window.addEventListener(OPEN, fn);
  return () => window.removeEventListener(OPEN, fn);
}

// A page asked to open before its code had loaded: remembered here, and
// picked up by that page when it mounts.
let pendingOpen: string | null = null;
export function setPendingOpen(kind: string) { pendingOpen = kind; }
export function takePendingOpen(kind: string): boolean {
  if (pendingOpen !== kind) return false;
  pendingOpen = null;
  return true;
}

// "Your stamps" has its own hidden page, found on the Ownership screen.
export const OPEN_OWN = "wwc:open-your-stamps";
export function openYourStampsPage() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(OPEN_OWN));
}
export function onOpenYourStampsPage(fn: () => void): () => void {
  window.addEventListener(OPEN_OWN, fn);
  return () => window.removeEventListener(OPEN_OWN, fn);
}

// Owner stamps: the places the coat goes with you. Added from the last
// page; kept in the visitor's own browser, like the rest of the ownership
// record. Stamps carried over from a previous owner (see handover.ts) are
// stored alongside with `from` set to that owner's name.
export type OwnerStamp = {
  id: string;
  place: string;
  note?: string;
  month: string; // "YYYY-MM"
  shape: "circle" | "rect" | "hex" | "oval";
  tilt: number;
  from?: string;
};

const OWNER_KEY = "wornwith:COS-8821-4f2a:owner-stamps";
const SHAPES: OwnerStamp["shape"][] = ["oval", "circle", "rect", "hex"];
export const MAX_PLACE = 28;
export const MAX_NOTE = 60;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function sanitizeOwnerStamp(x: unknown): OwnerStamp | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const place = clean(o.place, MAX_PLACE);
  const month = typeof o.month === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(o.month) ? o.month : "";
  if (!place || !month) return null;
  const shape = SHAPES.includes(o.shape as OwnerStamp["shape"]) ? (o.shape as OwnerStamp["shape"]) : "oval";
  const tilt = typeof o.tilt === "number" && Math.abs(o.tilt) <= 15 ? Math.round(o.tilt) : 0;
  const note = clean(o.note, MAX_NOTE);
  const from = clean(o.from, 40);
  const id = clean(o.id, 40) || `${month}-${place}`;
  return { id, place, month, shape, tilt, ...(note ? { note } : {}), ...(from ? { from } : {}) };
}

let ownerMemory: OwnerStamp[] | null = null;

export function loadOwnerStamps(): OwnerStamp[] {
  if (ownerMemory) return ownerMemory;
  try {
    const raw = localStorage.getItem(OWNER_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    ownerMemory = Array.isArray(list) ? list.map(sanitizeOwnerStamp).filter((s): s is OwnerStamp => !!s) : [];
  } catch {
    ownerMemory = [];
  }
  return ownerMemory;
}

function saveOwnerStamps(list: OwnerStamp[]) {
  ownerMemory = list;
  try { localStorage.setItem(OWNER_KEY, JSON.stringify(list)); } catch { /* storage blocked */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGED));
}

export function addOwnerStamp(input: { place: string; note?: string; month: string; from?: string }): OwnerStamp | null {
  const list = loadOwnerStamps();
  const n = list.length;
  const stamp = sanitizeOwnerStamp({
    ...input,
    id: `${Date.now().toString(36)}${n}`,
    shape: SHAPES[n % SHAPES.length],
    tilt: [-7, 5, -3, 8, -9, 4][n % 6],
  });
  if (!stamp) return null;
  saveOwnerStamps([...list, stamp]);
  return stamp;
}

export function addOwnerStamps(stamps: OwnerStamp[]) {
  const list = loadOwnerStamps();
  const have = new Set(list.map((s) => s.id));
  saveOwnerStamps([...list, ...stamps.map(sanitizeOwnerStamp).filter((s): s is OwnerStamp => !!s && !have.has(s.id))]);
}

export function removeOwnerStamp(id: string) {
  saveOwnerStamps(loadOwnerStamps().filter((s) => s.id !== id));
}

// "2026-12" → "12 · 2026", the way the stamps print dates.
export function stampDate(month: string): string {
  const [y, m] = month.split("-");
  return `${m} · ${y}`;
}
