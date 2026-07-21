import type { WardrobeItem } from "./persistence";
import { GARMENT } from "./garment";

export type WeatherData = {
  tempF: number;
  precipProbability: number; // 0-100, today's max chance of rain
  windMph: number;
  humidity: number;
  morningTempF: number;
  afternoonTempF: number;
  eveningTempF: number;
  rainLikely: boolean;
};

// Open-Meteo is a free, keyless weather API — no signup, no API key, works
// directly from the browser. Real data, not simulated, as long as the
// visitor grants location access.
export function fetchWeather(): Promise<WeatherData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`;
          const res = await fetch(url);
          const data = await res.json();
          const hourlyTemps: number[] = data.hourly.temperature_2m;
          const maxRain = Math.round(data.daily.precipitation_probability_max?.[0] ?? 0);
          resolve({
            tempF: Math.round(data.current.temperature_2m),
            precipProbability: maxRain,
            windMph: Math.round(data.current.wind_speed_10m),
            humidity: Math.round(data.current.relative_humidity_2m),
            morningTempF: Math.round(hourlyTemps[8] ?? data.current.temperature_2m),
            afternoonTempF: Math.round(hourlyTemps[14] ?? data.current.temperature_2m),
            eveningTempF: Math.round(hourlyTemps[20] ?? data.current.temperature_2m),
            rainLikely: maxRain > 40,
          });
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 6000 }
    );
  });
}

// Converts a formal item/product name into a natural, lowercase spoken
// description — "COS Black Wool Funnel-Neck Coat" -> "your black wool
// coat". Full product names are reserved for the Product Passport screen
// specifically, per the editorial writing style.
export function naturalName(name: string): string {
  const cleaned = name
    .replace(/^COS\s+/i, "")
    .replace(/^The\s+/i, "")
    .replace(/\bFunnel-Neck\b/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return `your ${cleaned.toLowerCase()}`;
}

// Capitalizes only the first character — for sentence-start display,
// unlike CSS `capitalize` which title-cases every word.
export function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const WARM_KEYWORDS = ["linen", "cotton", "poplin", "silk", "slip"];
const COLD_KEYWORDS = ["wool", "coat", "knit", "trench", "overshirt"];

export type FeaturedPick = {
  name: string;
  isMainGarment: boolean;
  loggedAt?: string;
  worn?: string;
};

// Real rule-based logic, not fabricated copy: colder + wetter days score
// wool/coat items higher, warmer/drier days score linen/cotton/silk items
// higher. Falls back to the passport garment (the coat) when nothing in
// the wardrobe scores clearly better, since that's the one item this demo
// actually has full data for.
export function pickFeaturedItem(
  wardrobe: WardrobeItem[],
  weather: WeatherData | null
): FeaturedPick {
  const isCold = !weather || weather.tempF < 60;
  const isWet = weather ? weather.precipProbability > 40 : true;

  const scored = wardrobe.map((item) => {
    const lower = item.name.toLowerCase();
    let score = 0;
    if (isCold || isWet) {
      if (COLD_KEYWORDS.some((k) => lower.includes(k))) score += 2;
      if (WARM_KEYWORDS.some((k) => lower.includes(k))) score -= 1;
    } else {
      if (WARM_KEYWORDS.some((k) => lower.includes(k))) score += 2;
      if (COLD_KEYWORDS.some((k) => lower.includes(k))) score -= 1;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if ((isCold || isWet) && (!best || best.score <= 0)) {
    // Nothing in the wardrobe reads as cold-weather outerwear — the coat
    // this whole passport is about is the honest answer.
    return { name: GARMENT.name, isMainGarment: true };
  }

  if (best && best.score > 0) {
    return { name: best.item.name, isMainGarment: false, loggedAt: best.item.loggedAt, worn: best.item.worn };
  }

  return { name: GARMENT.name, isMainGarment: true };
}

export function pickAlternatives(
  wardrobe: WardrobeItem[],
  featuredName: string,
  count = 3
): WardrobeItem[] {
  return wardrobe.filter((it) => it.name !== featuredName).slice(0, count);
}

// Days since an item's last recorded activity — a real computed value from
// its loggedAt date, not a fabricated number. Returns null if unknown.
export function daysSinceLogged(loggedAt?: string): number | null {
  if (!loggedAt) return null;
  const ms = Date.now() - new Date(loggedAt).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

// Picks which editorial observation reads truest for the real numbers,
// without ever surfacing a percentage or a technical term. Genuinely
// data-driven — just translated into magazine-copy language instead of a
// weather-app readout.
export function getWeatherObservationKey(w: WeatherData): string {
  if (w.rainLikely) return "obs_rain";
  if (w.morningTempF < 55 && w.afternoonTempF - w.morningTempF >= 8) return "obs_warming";
  if (w.morningTempF < 55 && w.afternoonTempF < 65) return "obs_cool";
  if (w.afternoonTempF >= 72) return "obs_clear_warm";
  return "obs_mild";
}

// Same idea for the short line under the recommended garment's name.
export function getReasoningKey(w: WeatherData | null): string {
  if (!w) return "reasoning_default";
  if (w.rainLikely) return "reasoning_rain";
  if (w.afternoonTempF < 60) return "reasoning_cool";
  if (w.afternoonTempF >= 72) return "reasoning_warm";
  return "reasoning_default";
}

// "Not worn in over a week" reads like a stylist's note; "not worn in 9
// days" reads like a database. Real number in, editorial banding out.
export function getNotWornPhraseKey(days: number | null): string | null {
  if (days === null || days < 7) return null;
  if (days < 14) return "not_worn_week";
  if (days < 30) return "not_worn_two_weeks";
  return "not_worn_month";
}

// Parses "18×" style wear counts into a number.
export function parseWornCount(worn?: string): number {
  if (!worn) return 0;
  const match = worn.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
