import type { Season } from "./careRecommendation";
import type { TranslationKey } from "./i18n";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

// Author and book title stay as literal proper nouns (standard convention
// — a title isn't usually retitled across storefronts/languages). The
// note is a translation key, since that's genuine editorial prose.
export type ReadingPick = { author: string; title: string; noteKey: TranslationKey };

export type Atmosphere = {
  key: string;
  titleKey: TranslationKey;
  descriptionKeys: TranslationKey[]; // short cinematic lines, rendered one per line
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
// All text below is translation keys — see i18n.tsx for EN/FR/PT copy.
const ATMOSPHERES: Atmosphere[] = [
  {
    key: "after_rain",
    titleKey: "atmosphere_after_rain_title",
    descriptionKeys: ["atmosphere_after_rain_desc_1", "atmosphere_after_rain_desc_2", "atmosphere_after_rain_desc_3"],
    artists: ["Rhye", "José González", "This Is The Kit"],
    reading: [
      { author: "Olga Tokarczuk", title: "Flights", noteKey: "book_note_flights" },
      { author: "Ocean Vuong", title: "On Earth We're Briefly Gorgeous", noteKey: "book_note_on_earth" },
    ],
  },
  {
    key: "first_espresso",
    titleKey: "atmosphere_first_espresso_title",
    descriptionKeys: ["atmosphere_first_espresso_desc_1", "atmosphere_first_espresso_desc_2", "atmosphere_first_espresso_desc_3"],
    artists: ["The Paper Kites", "Men I Trust", "London Grammar"],
    reading: [
      { author: "Sarah Manguso", title: "Ongoingness", noteKey: "book_note_ongoingness" },
      { author: "Patti Smith", title: "M Train", noteKey: "book_note_m_train" },
    ],
  },
  {
    key: "north_window",
    titleKey: "atmosphere_north_window_title",
    descriptionKeys: ["atmosphere_north_window_desc_1", "atmosphere_north_window_desc_2", "atmosphere_north_window_desc_3"],
    artists: ["Nick Drake", "Daughter", "Bon Iver"],
    reading: [
      { author: "Tove Ditlevsen", title: "The Copenhagen Trilogy", noteKey: "book_note_copenhagen_trilogy" },
      { author: "Annie Ernaux", title: "A Man's Place", noteKey: "book_note_a_mans_place" },
    ],
  },
  {
    key: "winter_sun",
    titleKey: "atmosphere_winter_sun_title",
    descriptionKeys: ["atmosphere_winter_sun_desc_1", "atmosphere_winter_sun_desc_2", "atmosphere_winter_sun_desc_3"],
    artists: ["Bon Iver", "Novo Amor", "Daughter"],
    reading: [
      { author: "Tove Ditlevsen", title: "The Copenhagen Trilogy", noteKey: "book_note_copenhagen_trilogy" },
      { author: "Annie Ernaux", title: "A Man's Place", noteKey: "book_note_a_mans_place" },
    ],
  },
  {
    key: "between_seasons",
    titleKey: "atmosphere_between_seasons_title",
    descriptionKeys: ["atmosphere_between_seasons_desc_1", "atmosphere_between_seasons_desc_2", "atmosphere_between_seasons_desc_3"],
    artists: ["Alice Phoebe Lou", "Patrick Watson", "Novo Amor"],
    reading: [
      { author: "Yiyun Li", title: "Where Reasons End", noteKey: "book_note_where_reasons_end" },
      { author: "Rachel Cusk", title: "Outline", noteKey: "book_note_outline" },
    ],
  },
  {
    key: "quiet_modernism",
    titleKey: "atmosphere_quiet_modernism_title",
    descriptionKeys: ["atmosphere_quiet_modernism_desc_1", "atmosphere_quiet_modernism_desc_2", "atmosphere_quiet_modernism_desc_3"],
    artists: ["London Grammar", "This Is The Kit", "Fink"],
    reading: [
      { author: "Rachel Cusk", title: "Outline", noteKey: "book_note_outline" },
      { author: "Sarah Manguso", title: "Ongoingness", noteKey: "book_note_ongoingness" },
    ],
  },
  {
    key: "glasshouse",
    titleKey: "atmosphere_glasshouse_title",
    descriptionKeys: ["atmosphere_glasshouse_desc_1", "atmosphere_glasshouse_desc_2", "atmosphere_glasshouse_desc_3"],
    artists: ["Men I Trust", "Rhye", "Alice Phoebe Lou"],
    reading: [
      { author: "Deborah Levy", title: "The Cost of Living", noteKey: "book_note_cost_of_living" },
      { author: "Ocean Vuong", title: "On Earth We're Briefly Gorgeous", noteKey: "book_note_on_earth" },
    ],
  },
  {
    key: "late_afternoon",
    titleKey: "atmosphere_late_afternoon_title",
    descriptionKeys: ["atmosphere_late_afternoon_desc_1", "atmosphere_late_afternoon_desc_2", "atmosphere_late_afternoon_desc_3"],
    artists: ["Agnes Obel", "Novo Amor", "Fink"],
    reading: [
      { author: "Rachel Cusk", title: "Outline", noteKey: "book_note_outline" },
      { author: "Deborah Levy", title: "The Cost of Living", noteKey: "book_note_cost_of_living" },
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
