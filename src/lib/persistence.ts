// Persists visitor data in their own browser (localStorage), scoped per
// garment via DPP_ID. No backend needed — this is enough for a real,
// working demo where someone's input survives a refresh or a return visit.
// Note: this is per-device/per-browser only. It won't sync across a
// person's phone and laptop, and clearing browser data clears it.

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
};

const defaultWardrobe: WardrobeItem[] = [
  { name: "The Marais Coat", tag: "DPP", worn: "18×", note: "March dinner · Paris, New York" },
  { name: "Silk Slip Dress", tag: null, worn: "7×", note: "June birthday · London" },
  { name: "Linen Trousers", tag: null, worn: "2×", note: "Last: Lisbon trip" },
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
