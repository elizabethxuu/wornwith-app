import { GARMENT } from "./garment";

export type CareTier = "excellent" | "moderate" | "heavy";
export type Season = "spring" | "summer" | "autumn" | "winter";

// Parses "~18" style wear counts into a real number.
export function parseWearCount(worn: string): number {
  const match = worn.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Wear thresholds — genuinely tied to the recorded count, not fixed copy.
// A garment doesn't need professional attention until real wear
// accumulates; these bands are deliberately generous, matching the
// "quiet, not alarmist" tone the brief asks for.
export function getCareTier(wearCount: number): CareTier {
  if (wearCount >= 60) return "heavy";
  if (wearCount >= 30) return "moderate";
  return "excellent";
}

// Real current season from today's date (Northern Hemisphere, matching
// the garment's stated origin/care context) — recalculates on its own as
// time passes, nothing hardcoded.
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function getCareRecommendation() {
  const wearCount = parseWearCount(GARMENT.timesWorn);
  const tier = getCareTier(wearCount);
  const season = getCurrentSeason();
  return { wearCount, tier, season };
}
