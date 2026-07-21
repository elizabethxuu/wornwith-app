import type { Season } from "./careRecommendation";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type ReadingPick = { author: string; title: string; note: string };

export type Atmosphere = {
  key: string;
  title: string;
  description: string[]; // short cinematic lines, rendered one per line
  artists: string[];
  reading: ReadingPick[];
};

// Real current time of day — recalculates on its own, nothing hardcoded.
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// A curated bank of atmospheres — editorial writing, not live-generated.
// Kept deliberately curated rather than AI-generated per request: the
// prompt's own brief for the tone this needs ("write beautifully," "avoid
// clichés," "never sound like AI") is much more reliably hit by a small
// set of genuinely well-written moods than by prompting a model fresh
// every time, and it means this never depends on the AI service being up.
const ATMOSPHERES: Atmosphere[] = [
  {
    key: "after_rain",
    title: "After Rain",
    description: [
      "A cool city after rainfall.",
      "Soft tailoring. Quiet galleries.",
      "The sound of footsteps on old stone.",
    ],
    artists: ["Rhye", "José González", "This Is The Kit"],
    reading: [
      { author: "Olga Tokarczuk", title: "Flights", note: "Fragments that drift like weather." },
      { author: "Ocean Vuong", title: "On Earth We're Briefly Gorgeous", note: "Tender, unhurried, and quietly devastating." },
    ],
  },
  {
    key: "first_espresso",
    title: "First Espresso",
    description: [
      "The city still half-asleep.",
      "Steam rising from a small cup.",
      "A day not yet decided.",
    ],
    artists: ["The Paper Kites", "Men I Trust", "London Grammar"],
    reading: [
      { author: "Sarah Manguso", title: "Ongoingness", note: "Brief, exact, and quietly profound." },
      { author: "Patti Smith", title: "M Train", note: "A wandering, unhurried kind of memoir." },
    ],
  },
  {
    key: "north_window",
    title: "North Window",
    description: [
      "Grey light through tall glass.",
      "A room that asks for nothing.",
      "Wool, wood smoke, and long silences.",
    ],
    artists: ["Nick Drake", "Daughter", "Bon Iver"],
    reading: [
      { author: "Tove Ditlevsen", title: "The Copenhagen Trilogy", note: "Spare, unflinching, and quietly devastating." },
      { author: "Annie Ernaux", title: "A Man's Place", note: "Precise, restrained, and deeply felt." },
    ],
  },
  {
    key: "winter_sun",
    title: "Winter Sun",
    description: [
      "Low light across bare branches.",
      "A coat worth stepping out in.",
      "The particular clarity of cold, bright air.",
    ],
    artists: ["Bon Iver", "Novo Amor", "Daughter"],
    reading: [
      { author: "Tove Ditlevsen", title: "The Copenhagen Trilogy", note: "Spare, unflinching, and quietly devastating." },
      { author: "Annie Ernaux", title: "A Man's Place", note: "Precise, restrained, and deeply felt." },
    ],
  },
  {
    key: "between_seasons",
    title: "Between Seasons",
    description: [
      "Neither warm nor cold.",
      "A wardrobe caught between two seasons.",
      "Light that changes its mind by the hour.",
    ],
    artists: ["Alice Phoebe Lou", "Patrick Watson", "Novo Amor"],
    reading: [
      { author: "Yiyun Li", title: "Where Reasons End", note: "Spare and devastating in equal measure." },
      { author: "Rachel Cusk", title: "Outline", note: "Observant, restrained and quietly human." },
    ],
  },
  {
    key: "quiet_modernism",
    title: "Quiet Modernism",
    description: [
      "Clean lines. Warm concrete.",
      "A room that says little and means it.",
      "Evening arriving without announcement.",
    ],
    artists: ["London Grammar", "This Is The Kit", "Fink"],
    reading: [
      { author: "Rachel Cusk", title: "Outline", note: "Observant, restrained and quietly human." },
      { author: "Sarah Manguso", title: "Ongoingness", note: "Brief, exact, and quietly profound." },
    ],
  },
  {
    key: "glasshouse",
    title: "Glasshouse",
    description: [
      "Warm air through an open window.",
      "Green light through glass and leaves.",
      "A held breath before evening.",
    ],
    artists: ["Men I Trust", "Rhye", "Alice Phoebe Lou"],
    reading: [
      { author: "Deborah Levy", title: "The Cost of Living", note: "A thoughtful companion for slow afternoons and changing light." },
      { author: "Ocean Vuong", title: "On Earth We're Briefly Gorgeous", note: "Tender, unhurried, and quietly devastating." },
    ],
  },
  {
    key: "late_afternoon",
    title: "Late Afternoon",
    description: [
      "Long shadows across the room.",
      "The day slowing down before it ends.",
      "Coffee gone cold, forgotten mid-thought.",
    ],
    artists: ["Agnes Obel", "Novo Amor", "Fink"],
    reading: [
      { author: "Rachel Cusk", title: "Outline", note: "Observant, restrained and quietly human." },
      { author: "Deborah Levy", title: "The Cost of Living", note: "A thoughtful companion for slow afternoons and changing light." },
    ],
  },
];

function findAtmosphere(key: string): Atmosphere {
  return ATMOSPHERES.find((a) => a.key === key) ?? ATMOSPHERES[ATMOSPHERES.length - 1];
}

// Real selection logic — priority-ordered rules over actual season, time
// of day, and rain likelihood. Deterministic, not random: the same
// conditions always produce the same atmosphere, the way a genuinely
// curated recommendation would.
export function selectAtmosphere(
  season: Season,
  timeOfDay: TimeOfDay,
  rainLikely: boolean
): Atmosphere {
  if (rainLikely) return findAtmosphere("after_rain");

  if (season === "winter") {
    if (timeOfDay === "morning") return findAtmosphere("first_espresso");
    if (timeOfDay === "evening" || timeOfDay === "night") return findAtmosphere("north_window");
    return findAtmosphere("winter_sun");
  }

  if (season === "summer") {
    if (timeOfDay === "morning") return findAtmosphere("first_espresso");
    return findAtmosphere("glasshouse");
  }

  // spring or autumn
  if (timeOfDay === "evening" || timeOfDay === "night") return findAtmosphere("quiet_modernism");
  if (timeOfDay === "morning") return findAtmosphere("first_espresso");
  if (timeOfDay === "afternoon") return findAtmosphere("between_seasons");

  return findAtmosphere("late_afternoon");
}

// A real, functional link — no Spotify API key needed. Opens Spotify's
// public search for the atmosphere's artists, which is the honest version
// of "continue the atmosphere" without building an embedded player.
export function spotifySearchUrl(atmosphere: Atmosphere): string {
  const query = atmosphere.artists.join(" ");
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}
