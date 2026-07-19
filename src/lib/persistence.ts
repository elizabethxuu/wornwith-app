// Persists visitor data in their own browser (localStorage), scoped per
// garment via DPP_ID. No backend needed — this is enough for a real,
// working demo where someone's input survives a refresh or a return visit.
// Note: this is per-device/per-browser only. It won't sync across a
// person's phone and laptop, and clearing browser data clears it.

import { FORMSPREE_ENDPOINT } from "./config";

// Sends captured data to you (not just the visitor's own browser) if a
// Formspree endpoint is configured. Fails silently if not configured or if
// the request fails — this is a nice-to-have, not something that should
// ever break the actual experience for a visitor.
function sendToFormspree(payload: Record<string, string>) {
  if (!FORMSPREE_ENDPOINT) return;
  fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // ignore — this should never block the visitor's actual experience
  });
}

const DPP_ID = "COS-8821-4f2a"; // matches the garment shown in the demo

function key(name: string) {
  return `wornwith:${DPP_ID}:${name}`;
}

export function loadMoment(): string {
  try {
    return localStorage.getItem(key("moment")) ?? "";
  } catch {
    return "";
  }
}

export function saveMoment(text: string) {
  try {
    localStorage.setItem(key("moment"), text);
  } catch {
    // localStorage can throw in private-browsing/storage-full edge cases;
    // fail silently rather than break the experience.
  }
}

export type WardrobeItem = {
  name: string;
  tag: string | null;
  worn: string;
  note: string;
  brand?: string;
  loggedAt?: string; // ISO date (yyyy-mm-dd), used for the calendar filter
};

const defaultWardrobe: WardrobeItem[] = [
  { name: "The Marais Coat", tag: "DPP", worn: "18×", note: "March dinner · Paris, New York", brand: "COS", loggedAt: "2026-03-14" },
  { name: "Silk Slip Dress", tag: null, worn: "7×", note: "June birthday · London", brand: "Reformation", loggedAt: "2026-06-02" },
  { name: "Linen Trousers", tag: null, worn: "2×", note: "Last: Lisbon trip", brand: "Everlane", loggedAt: "2026-07-01" },
];

export function loadWardrobe(): WardrobeItem[] {
  try {
    const raw = localStorage.getItem(key("wardrobe"));
    if (!raw) return defaultWardrobe;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return defaultWardrobe;
  } catch {
    return defaultWardrobe;
  }
}

export function saveWardrobe(items: WardrobeItem[]) {
  try {
    localStorage.setItem(key("wardrobe"), JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Care checklist — which of the 4 care instructions the visitor has checked
export function loadCareChecks(): boolean[] {
  try {
    const raw = localStorage.getItem(key("care-checks"));
    if (!raw) return [false, false, false, false];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    return [false, false, false, false];
  } catch {
    return [false, false, false, false];
  }
}

export function saveCareChecks(checks: boolean[]) {
  try {
    localStorage.setItem(key("care-checks"), JSON.stringify(checks));
  } catch {
    // ignore
  }
}

// A running log of saved "when will you wear this" moments, most recent last
export type SavedMoment = { text: string; savedAt: string };

export function loadMoments(): SavedMoment[] {
  try {
    const raw = localStorage.getItem(key("moments"));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addMoment(text: string): SavedMoment[] {
  const moments = loadMoments();
  const updated = [...moments, { text, savedAt: new Date().toISOString() }];
  try {
    localStorage.setItem(key("moments"), JSON.stringify(updated));
  } catch {
    // ignore
  }
  sendToFormspree({
    type: "saved-moment",
    dppId: DPP_ID,
    text,
    savedAt: new Date().toISOString(),
  });
  return updated;
}

// Call this when a visitor explicitly logs a new wardrobe memory or saves
// this garment to their wardrobe — a real, meaningful signal worth sending,
// as opposed to every incidental list mutation (like deleting an item).
export function logWardrobeEvent(item: WardrobeItem) {
  sendToFormspree({
    type: "wardrobe-event",
    dppId: DPP_ID,
    itemName: item.name,
    note: item.note,
    loggedAt: new Date().toISOString(),
  });
}
