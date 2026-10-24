// Shared between the Journey chips and the map on the Story screen.
// The map is lazy-loaded, so its pin colors live here (a tiny module)
// rather than inside JourneyMap, and the chips can use them without
// pulling the map library into the main bundle.

// Pin accents, in journey order: NZ, Italy, Portugal, Paris.
export const STOP_ACCENTS = ["#2FC7D8", "#D19A63", "#8A7F76", "#A94C63"];

// A chip tap asks the map to open on one pin. The request is held until
// the map mounts (it usually mounts right after the screen changes), and
// an event covers the case where the map is already on screen.
let pending: number | null = null;
const EVENT = "wwc:focus-stop";

export function requestMapStop(index: number) {
  pending = index;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: index }));
}

export function takePendingMapStop(): number | null {
  const i = pending;
  pending = null;
  return i;
}

export function onMapStopRequest(fn: (index: number) => void): () => void {
  const handler = (e: Event) => { pending = null; fn((e as CustomEvent<number>).detail); };
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
