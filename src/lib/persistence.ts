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

// The Ownership Memory Repository — one persisted record per garment,
// covering everything a real provenance record would track. Kept as a
// flat, plainly-typed object (no nested logic, no derived fields) so it
// could later be hashed and anchored on-chain without any UI changes —
// "blockchain-ready" here means "clean, stable schema," not an actual
// chain integration, which would need a real wallet/contract layer this
// environment can't provide.
export type OwnershipRecord = {
  owner?: string;
  purchaseDate?: string;
  purchaseLocation?: string;
  purchasePrice?: string;
  originalRetailer?: string;
  condition?: string;
  repairHistory?: string;
  wearCount?: string;
  favoriteMemories?: string;
  travelHistory?: string;
  notes?: string;
};

export function loadOwnershipRecord(): OwnershipRecord {
  try {
    const raw = localStorage.getItem(key("ownership-record"));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveOwnershipRecord(record: OwnershipRecord) {
  try {
    localStorage.setItem(key("ownership-record"), JSON.stringify(record));
  } catch {
    // ignore
  }
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
  nameKey?: "seed_name_marais" | "seed_name_silk" | "seed_name_linen";
  tag: string | null;
  worn: string;
  note: string;
  noteKey?: "seed_note_marais" | "seed_note_silk" | "seed_note_linen";
  brand?: string;
  loggedAt?: string; // ISO date (yyyy-mm-dd), used for the calendar filter
  resold?: boolean;
  photo?: string; // compressed base64 data URL
  occasion?: string;
  season?: string;
  favoriteNotes?: string;
};

const defaultWardrobe: WardrobeItem[] = [
  { name: "The Marais Coat", nameKey: "seed_name_marais", tag: "DPP", worn: "18×", note: "March dinner · Paris, New York", noteKey: "seed_note_marais", brand: "COS", loggedAt: "2026-03-14" },
  { name: "Silk Slip Dress", nameKey: "seed_name_silk", tag: null, worn: "7×", note: "June birthday · London", noteKey: "seed_note_silk", brand: "Reformation", loggedAt: "2026-06-02", resold: true },
  { name: "Linen Trousers", nameKey: "seed_name_linen", tag: null, worn: "2×", note: "Last: Lisbon trip", noteKey: "seed_note_linen", brand: "Everlane", loggedAt: "2026-07-01", resold: true },
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

// A running log of saved "when will you wear this" moments, most recent last
export type SavedMoment = { text: string; savedAt: string; summary?: string };

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

// Patches a specific moment with its AI-generated reflection once it comes
// back from the API — matched by savedAt since that's set at creation and
// never changes.
export function updateMomentSummary(savedAt: string, summary: string): SavedMoment[] {
  const moments = loadMoments();
  const updated = moments.map((m) => (m.savedAt === savedAt ? { ...m, summary } : m));
  try {
    localStorage.setItem(key("moments"), JSON.stringify(updated));
  } catch {
    // ignore
  }
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

// Compresses a photo before storing it — localStorage has a ~5-10MB total
// budget, so a handful of full-resolution phone photos would blow through
// that fast. This resizes to a max dimension and re-encodes as JPEG.
export function compressImage(file: File, maxDimension = 480, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
