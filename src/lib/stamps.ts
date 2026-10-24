// Passport stamps, the hidden last page. A stamp is collected the first
// time its stop is opened (on the Journey timeline, the Story map, or a
// country chip). Kept in the visitor's own browser; if storage is blocked
// the stamps simply don't persist between visits.

const KEY = "wornwith:COS-8821-4f2a:stamps";
const CHANGED = "wwc:stamps-changed";
const OPEN = "wwc:open-stamps";
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
