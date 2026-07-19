// This is the one place all garment-specific facts live. Right now it's
// hardcoded to a single demo coat, but every screen reads from here rather
// than hardcoding its own copy of "COS Black Wool Funnel-Neck Coat" —
// which is the seam where this would connect to a real product catalog or
// database (one row per DPP-ID) instead of a single hardcoded object.

export const GARMENT = {
  dppId: "4f2a",
  fullDppId: "#DPP-204839",
  brand: "COS",
  brandSku: "COS-8821",
  name: "COS Black Wool Funnel-Neck Coat",
  tagline: "Sustainable materials, timeless style",
  image: "/images/cos-wool-jacket.png",
  material: "70% Recycled Wool",
  madeIn: "Italy & Portugal",
  certified: "RWS · GOTS",
  lifespan: "8–10 years",
  ownedSince: "April 2026",
  timesWorn: "~18",
  condition: "Excellent",
  estLifespan: "6+ years",
  verifiedDate: "April 2026",
};

export type Garment = typeof GARMENT;
