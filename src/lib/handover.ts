// Pass it on: handing the coat, and its passport, to the next owner.
// The handover travels inside the link itself, in the part after "#",
// which browsers never send to a server. It carries the previous owner's
// name, a note, and their stamps; the next owner opens it and the passport
// begins a new chapter with all of it attached. No account, no database.
import { addOwnerStamps, loadOwnerStamps, sanitizeOwnerStamp, type OwnerStamp } from "./stamps";

export type Handover = { v: 1; from: string; note: string; at: string; stamps: OwnerStamp[] };
export type PreviousOwner = { from: string; note: string; at: string };

const PREV_KEY = "wornwith:COS-8821-4f2a:previous-owners";
const HASH = "handover=";
export const MAX_NAME = 40;
export const MAX_HANDOVER_NOTE = 280;
const MAX_STAMPS = 24;

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "");

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function sanitizeHandover(x: unknown): Handover | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.v !== 1) return null;
  const at = typeof o.at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.at) ? o.at : "";
  if (!at) return null;
  const stamps = Array.isArray(o.stamps)
    ? o.stamps.slice(0, MAX_STAMPS).map(sanitizeOwnerStamp).filter((s): s is OwnerStamp => !!s)
    : [];
  return { v: 1, from: clean(o.from, MAX_NAME), note: clean(o.note, MAX_HANDOVER_NOTE), at, stamps };
}

export function encodeHandover(h: Handover): string {
  return toBase64Url(JSON.stringify(h));
}

export function decodeHandover(encoded: string): Handover | null {
  try {
    if (encoded.length > 12000) return null;
    return sanitizeHandover(JSON.parse(fromBase64Url(encoded)));
  } catch {
    return null;
  }
}

// The link to send: the passport's own address plus the handover.
export function createHandoverUrl(passportLink: string, input: { from: string; note: string; includeStamps: boolean }): string {
  const h: Handover = {
    v: 1,
    from: clean(input.from, MAX_NAME),
    note: clean(input.note, MAX_HANDOVER_NOTE),
    at: new Date().toISOString().slice(0, 10),
    // Your stamps travel on; ones already inherited keep their original owner.
    stamps: input.includeStamps ? loadOwnerStamps().slice(-MAX_STAMPS) : [],
  };
  return `${passportLink.split("#")[0]}#${HASH}${encodeHandover(h)}`;
}

export function readHandoverFromHash(hash: string): Handover | null {
  const i = hash.indexOf(HASH);
  return i === -1 ? null : decodeHandover(hash.slice(i + HASH.length));
}

export function loadPreviousOwners(): PreviousOwner[] {
  try {
    const raw = localStorage.getItem(PREV_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list)
      ? list
          .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>) : null))
          .filter((p): p is Record<string, unknown> => !!p)
          .map((p) => ({ from: clean(p.from, MAX_NAME), note: clean(p.note, MAX_HANDOVER_NOTE), at: clean(p.at, 10) }))
      : [];
  } catch {
    return [];
  }
}

// The new owner accepts: the previous owner joins the passport's history,
// and their stamps come along, marked as theirs.
export function acceptHandover(h: Handover, fallbackName: string) {
  const from = h.from || fallbackName;
  const prev = loadPreviousOwners();
  if (!prev.some((p) => p.from === from && p.at === h.at)) {
    try { localStorage.setItem(PREV_KEY, JSON.stringify([...prev, { from, note: h.note, at: h.at }])); } catch { /* storage blocked */ }
  }
  addOwnerStamps(h.stamps.map((s) => ({ ...s, id: `${h.at}-${s.id}`, from: s.from || from })));
}

// The new chapter's number: one for the coat's first owner, plus one for
// each handover it has been through.
export function chapterNumber(): number {
  return loadPreviousOwners().length + 1;
}
