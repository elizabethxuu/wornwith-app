import { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import type { WardrobeItem } from "../lib/persistence";
import { requestVoice } from "../lib/voice";
import { useChapterColor } from "../lib/chapterColor";
import { getCurrentSeason } from "../lib/careRecommendation";
import { getTimeOfDay, selectAtmosphere, spotifySearchUrl, type Atmosphere } from "../lib/interlude";
import {
  fetchWeather,
  pickFeaturedItem,
  pickAlternatives,
  naturalName,
  daysSinceLogged,
  parseWornCount,
  getWeatherObservationKey,
  getReasoningKey,
  getNotWornPhraseKey,
  capitalizeFirst,
  type WeatherData,
} from "../lib/todaysEdit";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const color = useChapterColor();
  return (
    <p
      className="text-[10px] tracking-[0.18em] uppercase font-sans font-semibold transition-colors duration-500"
      style={{ color }}
    >
      {children}
    </p>
  );
}

export function Donut({
  percent,
  label,
  sublabel,
  color = "#C97A8C",
}: {
  percent: number;
  label: string;
  sublabel: string;
  color?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Kick off the fill on the next tick so the browser paints the 0%
    // state first — otherwise React batches straight to the final value
    // and the stroke transition never has anything to animate from.
    const t = setTimeout(() => setDisplayed(percent), 50);
    return () => clearTimeout(t);
  }, [percent]);

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (displayed / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[84px] h-[84px]">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} fill="none" stroke="#F1E9EA" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
            style={{ transition: "stroke-dashoffset 1.1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display italic text-lg text-ink">
          {displayed}%
        </div>
      </div>
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide">{label}</p>
      <p className="text-[10px] font-sans text-clay/85">{sublabel}</p>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-paper border border-line rounded-card px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

const worldMapUrl = "/data/world-110m.json";
// Per-country watercolor wash — France (Paris) is the one deliberate
// burgundy focal point; NZ gets the turquoise primary; Italy reads
// slightly warmer; Portugal stays neutral, per the brief.
const COUNTRY_WASH: Record<string, { fill: string; opacity: number }> = {
  "New Zealand": { fill: "#2FC7D8", opacity: 0.22 },
  Italy: { fill: "#E3B98E", opacity: 0.28 },
  Portugal: { fill: "#D9D5CF", opacity: 0.4 },
  France: { fill: "#EBC9D2", opacity: 0.4 },
};
const STOP_ACCENTS = ["#2FC7D8", "#D19A63", "#8A7F76", "#A94C63"]; // NZ, Italy, Portugal, Paris
// dx/dy fan each label out in its own direction so the three closely-spaced
// European stops (Portugal, Italy, Paris) don't stack on top of each other.
// leader: true draws a short connecting line from the pin to the label.
const journeyStops = [
  {
    coords: [172.5, -43.5] as [number, number],
    labelKey: "place_nz" as const,
    dx: 0,
    dy: -17,
    icon: "",
    placeKey: "place_full_nz" as const,
    blurbKey: "stop_blurb_nz" as const,
  },
  {
    coords: [8.05, 45.57] as [number, number],
    labelKey: "place_italy" as const,
    dx: 40,
    dy: 4,
    leader: true,
    icon: "",
    placeKey: "place_full_italy" as const,
    blurbKey: "stop_blurb_italy" as const,
  },
  {
    coords: [-8.61, 41.15] as [number, number],
    labelKey: "place_portugal" as const,
    dx: -48,
    dy: 10,
    leader: true,
    icon: "",
    placeKey: "place_full_portugal" as const,
    blurbKey: "stop_blurb_portugal" as const,
  },
  {
    coords: [2.35, 48.86] as [number, number],
    labelKey: "place_paris" as const,
    dx: 4,
    dy: -30,
    active: true,
    leader: true,
    icon: "",
    placeKey: "place_full_paris" as const,
    blurbKey: "stop_blurb_paris" as const,
  },
];

export function JourneyMap() {
  const { t } = useLanguage();
  // Defaults to the last stop (where the garment is now) since that's the
  // most relevant detail to show before anyone's tapped anything.
  const [selected, setSelected] = useState(journeyStops.length - 1);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const stop = journeyStops[selected];

  return (
    <div className="w-full mb-4" onClick={(e) => e.stopPropagation()}>
      <div
        className="w-full border border-line/60 rounded-card overflow-hidden transition-shadow duration-500"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 55% at 50% 32%, rgba(235,201,210,0.32) 0%, transparent 72%), " +
            "radial-gradient(ellipse 50% 45% at 86% 82%, rgba(47,199,216,0.20) 0%, transparent 72%), " +
            "linear-gradient(180deg, #FDFBF7 0%, #FAF7F1 100%)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 58 }}
          width={340}
          height={225}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <ZoomableGroup center={[0, 0]} zoom={1} minZoom={1} maxZoom={5}>
            <Geographies geography={worldMapUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const wash = COUNTRY_WASH[geo.properties.name];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={wash ? wash.fill : "#E5E2DC"}
                      fillOpacity={wash ? wash.opacity * 0.7 : 0.3}
                      stroke="#FAF7F1"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none", transition: "fill-opacity 1.2s ease" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {journeyStops.slice(0, -1).map((s, i) => (
              <Line
                key={i}
                from={s.coords}
                to={journeyStops[i + 1].coords}
                stroke="#2FC7D8"
                strokeWidth={1.0}
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: "1px",
                  strokeDashoffset: drawn ? 0 : 1,
                  transition: `stroke-dashoffset 0.9s ease ${i * 0.35}s`,
                }}
              />
            ))}

            {journeyStops.map((s, i) => {
              const stopColor = STOP_ACCENTS[i];
              return (
                <Marker key={s.labelKey} coordinates={s.coords}>
                  {/* Invisible larger touch target — the visible dot below is
                      deliberately small/precise, but a ~4-6px dot is too small
                      to reliably tap on a phone, so this circle underneath
                      captures taps across a much wider radius. */}
                  <circle
                    r={13}
                    fill="rgba(0,0,0,0.001)"
                    onClick={() => setSelected(i)}
                    style={{ cursor: "pointer", pointerEvents: "all" }}
                  />
                  {/* Paris carries a soft blush watercolor halo at all times
                      — it's the one deliberate burgundy focal point on the
                      map, not just another stop. */}
                  {s.active && (
                    <circle r={13} fill="#EBC9D2" fillOpacity={0.35} style={{ pointerEvents: "none" }} />
                  )}
                  {s.active && (
                    <circle r={8} fill={stopColor} fillOpacity={0.25}>
                      <animate attributeName="r" values="6;10;6" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={selected === i ? 7 : s.active ? 5 : 4}
                    fill={s.active || selected === i ? stopColor : "#FFFFFF"}
                    stroke={stopColor}
                    strokeWidth={1.3}
                    style={{ pointerEvents: "none" }}
                  />
                  {selected === i && (
                    <circle
                      r={9}
                      fill="none"
                      stroke={stopColor}
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  {s.leader && (
                    <line
                      x1={0}
                      y1={0}
                      x2={s.dx}
                      y2={s.dy + 3}
                      stroke={stopColor}
                      strokeWidth={0.6}
                      strokeOpacity={0.5}
                    />
                  )}
                  <text
                    x={s.dx}
                    y={s.dy}
                    textAnchor="middle"
                    paintOrder="stroke"
                    stroke="#FAF7F2"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    onClick={() => setSelected(i)}
                    style={{
                      cursor: "pointer",
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontWeight: s.active || selected === i ? 600 : 500,
                      fontSize: s.active || selected === i ? 15 : 13,
                      fill: s.active || selected === i ? stopColor : "#2E2E2E",
                    }}
                  >
                    {t(s.labelKey)}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tap-to-reveal detail card for whichever stop is selected — the
          gradient now lives on the map itself, so this returns to a
          quiet, flat cream card. Typography only, no decorative icon. */}
      <div
        className="mt-2.5 rounded-xl px-4 py-4 fade-up border border-line/40"
        style={{ backgroundColor: "#FAF7F1" }}
        key={selected}
      >
        <div className="min-w-0">
          <p
            className="font-sans text-[9px] uppercase tracking-[0.14em] font-semibold"
            style={{ color: "#A94C63" }}
          >
            {t(stop.placeKey)}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-snug mt-1.5">
            {t(stop.blurbKey)}
          </p>
        </div>
        {stop.active && (
          <p
            className="font-display italic text-[12px] text-right mt-3"
            style={{ color: "#2FC7D8" }}
          >
            {t("every_place_note")}
          </p>
        )}
      </div>

      <p className="font-sans text-[9px] text-clay/70 text-center mt-2">
        {t("tap_pin_hint")}
      </p>
    </div>
  );
}


export function Pill({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[12px] text-clay w-24 shrink-0">{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-sans text-[12px] text-ink font-medium w-9 text-right shrink-0">{percent}%</span>
    </div>
  );
}

export function Disclaimer() {
  const { t } = useLanguage();
  return (
    <p className="font-sans text-[8px] text-clay/60 text-center leading-relaxed mt-4 pt-3 border-t border-line/60">
      {t("demo_disclaimer")}
    </p>
  );
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionHref,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 fade-up">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="w-20 h-20 rounded-full bg-blush-pale flex items-center justify-center my-4">
        <Icon size={28} className="text-blush-deep" strokeWidth={1.5} />
      </div>
      <h2 className="font-display italic text-2xl text-ink mb-2 leading-tight">{title}</h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed max-w-[240px]">{subtitle}</p>
      {children}
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-5 bg-ink text-cream font-sans text-[13px] font-semibold px-6 py-3 rounded-full"
        >
          {actionLabel}
        </a>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-5 bg-ink text-cream font-sans text-[13px] font-semibold px-6 py-3 rounded-full"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ExpandableCard({
  title,
  bodyText,
  rows = [],
  footerText,
  learnMoreHref,
  learnMoreLabel,
  defaultOpen = false,
  children,
}: {
  title: string;
  bodyText?: string;
  rows?: [string, string][];
  footerText?: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-4 border border-line rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="font-sans text-[12px] font-semibold text-ink">{title}</span>
        <span
          className="text-clay transition-transform inline-block"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 fade-up">
          {bodyText && (
            <p className="font-sans text-[12px] text-clay leading-relaxed mb-3">{bodyText}</p>
          )}
          {children}
          {rows.length > 0 && (
            <div className="divide-y divide-line border-t border-line">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 font-sans text-[11px]">
                  <span className="text-clay">{k}</span>
                  <span className="text-ink text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
          {footerText && (
            <p className="text-[9px] text-clay/85 font-sans mt-2 pt-2 border-t border-line leading-relaxed">
              {footerText}
            </p>
          )}
          {learnMoreHref && (
            <a
              href={learnMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 font-sans text-[11px] text-blush-deep underline underline-offset-2"
            >
              {learnMoreLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}


// Calm, editorial loading transition — cycles through a few short phrases
// with a subtle fade, then calls onDone. Deliberately no progress bar or
// spinner, per the "luxury, not dashboard" direction.
export function ArchiveTransition({
  phrases,
  onDone,
}: {
  phrases: string[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const stepMs = 280;
    if (index >= phrases.length - 1) {
      const t = setTimeout(onDone, stepMs + 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIndex((i) => i + 1), stepMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="h-full flex items-center justify-center px-8">
      <p key={index} className="font-display italic text-lg text-clay fade-up text-center">
        {phrases[index]}
      </p>
    </div>
  );
}

export type ArchiveEntry = {
  year: string;
  category: string;
  title: string;
  description: string;
};

// The editorial replacement for the old plain lifecycle timeline — bigger
// per-entry blocks (category/title/description) and, per design direction,
// no literal "projected" label: completed entries get a filled marker,
// future ones a hollow marker, and that's the only signal.
export function ArchiveTimeline({ entries }: { entries: ArchiveEntry[] }) {
  const currentYear = new Date().getFullYear();
  const color = useChapterColor();
  return (
    <div className="relative pl-5">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
      <div className="space-y-6">
        {entries.map((e, i) => {
          const isFuture = Number(e.year) > currentYear;
          return (
            <div
              key={i}
              className="relative fade-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className="absolute -left-5 top-[5px] w-2.5 h-2.5 rounded-full border-2 border-paper transition-colors duration-500"
                style={{
                  backgroundColor: isFuture ? "#FFFFFF" : color,
                  boxShadow: isFuture ? `inset 0 0 0 1.5px ${color}` : undefined,
                }}
              />
              <p
                className="font-sans text-[9px] uppercase tracking-[0.14em] font-semibold transition-colors duration-500"
                style={{ color: isFuture ? "#6E635A" : color }}
              >
                {e.year} · {e.category}
              </p>
              <p className={`font-display italic text-base mt-0.5 ${isFuture ? "text-clay" : "text-ink"}`}>
                {e.title}
              </p>
              <p className={`font-sans text-[11px] mt-0.5 leading-relaxed ${isFuture ? "text-clay/80" : "text-clay"}`}>
                {e.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Converts "#556B8A" + an opacity fraction into an rgba() string — used
// for the Interlude button's subtle hover tint, since inline styles can't
// express :hover directly and the accent color is dynamic (chapter-driven).
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function TodaysEdit({ wardrobe }: { wardrobe: WardrobeItem[] }) {
  const { t } = useLanguage();
  const color = useChapterColor();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    fetchWeather().then((w) => {
      if (w) {
        setWeather(w);
        setWeatherStatus("ready");
      } else {
        setWeatherStatus("unavailable");
      }
    });
  }, []);

  const featured = pickFeaturedItem(wardrobe, weather);
  const itemName = naturalName(featured.name);
  const alternatives = pickAlternatives(wardrobe, featured.name, 3);
  const days = daysSinceLogged(featured.loggedAt);
  const wornCount = parseWornCount(featured.worn) || 18;
  const nextMaintenanceIn = Math.max(2, 20 - (wornCount % 20));

  const isCold = weather ? weather.afternoonTempF < 60 : null;
  const isWet = weather ? weather.rainLikely : null;

  const observationKey = weather ? getWeatherObservationKey(weather) : "obs_default";
  const reasoningKey = getReasoningKey(weather);
  const notWornKey = getNotWornPhraseKey(days);

  const briefingText = [t(observationKey as TranslationKey), itemName + ".", t(reasoningKey as TranslationKey)].join(" ");

  const careSeasonForAtmosphere = getCurrentSeason();
  const timeOfDay = getTimeOfDay();
  const atmosphere = selectAtmosphere(careSeasonForAtmosphere, timeOfDay, weather?.rainLikely ?? false);
  const [interludeState, setInterludeState] = useState<"closed" | "transitioning" | "open">("closed");
  // The delayed entrance animation on the "Enter the Listening Room"
  // button should only ever happen once, the very first time someone
  // encounters it — checked and persisted via localStorage, not a
  // per-session flag, so it genuinely never repeats on later visits.
  const [showEntranceHint] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem("wornwith:seenInterludeButton");
      if (!seen) {
        localStorage.setItem("wornwith:seenInterludeButton", "1");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
  const [enterButtonHovered, setEnterButtonHovered] = useState(false);

  return (
    <div className="mb-7 pb-7 border-b border-line">
      <Eyebrow>{t("todays_edit_title")}</Eyebrow>

      {/* Hero: editorial weather observation, not raw data */}
      <p className="font-display italic text-2xl text-ink leading-snug mt-2">
        {weather ? t(observationKey as TranslationKey) : t("obs_default")}
      </p>

      {/* Recommended garment — the actual hero moment */}
      <p className="font-display italic text-lg mt-4 transition-colors duration-500" style={{ color }}>
        {capitalizeFirst(itemName)}
      </p>
      <p className="font-sans text-[12px] text-ink/80 leading-relaxed mt-1">
        {t(reasoningKey as TranslationKey)}
      </p>

      {/* Interlude — sits between Recommended Garment and Why This Piece,
          per the required flow. Calm teaser card, no artwork, no player
          chrome — the atmosphere title as an invitation, with a distinct
          secondary-style entrance button beneath it. */}
      <div className="mt-5 py-4 border-t border-b border-line">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color }}>
          {t("interlude_title")}
        </p>
        <p className="font-sans text-[11px] text-clay mt-1">{t("interlude_supporting")}</p>
        <p className="font-display italic text-base text-ink mt-1.5">{atmosphere.title}</p>

        <button
          onClick={() => setInterludeState("transitioning")}
          onMouseEnter={() => setEnterButtonHovered(true)}
          onMouseLeave={() => setEnterButtonHovered(false)}
          className={`font-sans text-[12px] rounded-full px-6 py-2.5 mt-4 border transition-all duration-300 active:opacity-70 cursor-pointer ${
            showEntranceHint ? "fade-up" : ""
          }`}
          style={{
            borderWidth: "1px",
            borderColor: color,
            color,
            backgroundColor: enterButtonHovered ? hexToRgba(color, 0.07) : "#FFFFFF",
            animationDelay: showEntranceHint ? "800ms" : undefined,
          }}
        >
          {t("enter_listening_room")}
        </button>
      </div>

      {interludeState !== "closed" && (
        <ListeningRoom
          atmosphere={atmosphere}
          transitioning={interludeState === "transitioning"}
          onTransitionDone={() => setInterludeState("open")}
          onClose={() => setInterludeState("closed")}
          accentColor={color}
        />
      )}

      {/* Weather Summary — simplified, no raw metrics */}
      <div className="mt-5">
        {weatherStatus === "ready" && weather ? (
          <div className="flex items-center gap-5 font-sans text-[11px] text-clay">
            <span>{t("morning_label")} {weather.morningTempF}°</span>
            <span>{t("afternoon_label")} {weather.afternoonTempF}°</span>
            <span>{t("evening_label")} {weather.eveningTempF}°</span>
          </div>
        ) : weatherStatus === "loading" ? (
          <p className="font-sans text-[11px] text-clay/70 italic">…</p>
        ) : (
          <p className="font-sans text-[10px] text-clay/70">{t("weather_unavailable")}</p>
        )}
        {weather && (
          <p className="font-sans text-[11px] text-clay mt-1">
            {weather.rainLikely ? t("rain_expected") : t("clear_expected")}
          </p>
        )}
      </div>

      {/* Why this piece */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-blush-deep mb-2">
          {t("why_this_piece_title")}
        </p>
        <ul className="space-y-1">
          {[
            (isCold || isWet || weather === null) && t("reason_temperature"),
            weather && isWet && t("reason_weather"),
            notWornKey && t(notWornKey as TranslationKey),
            t("reason_condition"),
            t("reason_impact"),
          ]
            .filter(Boolean)
            .map((line, i) => (
              <li key={i} className="font-sans text-[11px] text-ink/80 flex items-start gap-1.5">
                <span className="text-clay shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Morning Brief — reusable voice player, premium-ready */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-blush-deep mb-2">
          {t("morning_brief_title")}
        </p>
        <VoicePlayer
          text={briefingText}
          listenLabel={t("listen_label")}
          stopLabel={t("stop_label")}
          unavailableLabel={t("voice_unavailable")}
        />
      </div>

      {/* Also Consider */}
      {alternatives.length > 0 && (
        <div className="mt-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-blush-deep mb-2">
            {t("alternatives_title")}
          </p>
          <ul className="space-y-1">
            {alternatives.map((a) => (
              <li key={a.name} className="font-sans text-[11px] text-ink/80 flex items-start gap-1.5">
                <span className="text-clay shrink-0">·</span>
                <span>{capitalizeFirst(naturalName(a.name))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Garment Readiness */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-blush-deep mb-2">
          {t("readiness_title")}
        </p>
        <p className="font-sans text-[11px] text-sage mb-0.5">{t("reason_condition")}</p>
        <p className="font-sans text-[11px] text-sage mb-0.5">{t("ready_to_wear")}</p>
        <p className="font-sans text-[11px] text-sage mb-2">{t("recently_maintained")}</p>
        <p className="font-sans text-[10px] text-clay">
          {t("estimated_maintenance")} — {t("estimated_after_wears").replace("{n}", String(nextMaintenanceIn))}
        </p>
      </div>
    </div>
  );
}


// A reusable narration player. The UI is finished and won't need to change
// when premium voice goes live — it already renders the same play/stop
// button regardless of which mode is actually speaking underneath.
export function VoicePlayer({
  text,
  listenLabel,
  stopLabel,
  unavailableLabel,
}: {
  text: string;
  listenLabel: string;
  stopLabel: string;
  unavailableLabel: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "unavailable">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
  };

  const play = async () => {
    setState("loading");
    const result = await requestVoice(text);
    if (result.mode === "premium") {
      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.play();
      setState("playing");
    } else if (result.mode === "browser") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("idle");
      window.speechSynthesis.speak(utterance);
      setState("playing");
    } else {
      setState("unavailable");
    }
  };

  const color = useChapterColor();

  if (state === "unavailable") {
    return <p className="font-sans text-[10px] text-clay/70">{unavailableLabel}</p>;
  }

  return (
    <button
      onClick={state === "playing" ? stop : play}
      disabled={state === "loading"}
      className="flex items-center gap-2 border border-line rounded-full px-4 py-2 font-sans text-[11px] text-ink disabled:opacity-50 transition-colors duration-500"
    >
      {state === "playing" ? (
        <Square size={12} style={{ color }} fill={color} />
      ) : (
        <Mic size={13} style={{ color }} />
      )}
      {state === "playing" ? stopLabel : listenLabel}
    </button>
  );
}

// The immersive full-screen "room" — covers the app chrome entirely
// (progress bar, nav arrows included) for the "entering a quiet space"
// feel the brief asks for. Two phases: a brief white-space transition
// showing only INTERLUDE + the atmosphere title, then a staggered reveal
// of the room's sections. No spring animation, no parallax — opacity and
// small vertical offsets only.
export function ListeningRoom({
  atmosphere,
  transitioning,
  onTransitionDone,
  onClose,
  accentColor,
}: {
  atmosphere: Atmosphere;
  transitioning: boolean;
  onTransitionDone: () => void;
  onClose: () => void;
  accentColor: string;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!transitioning) return;
    const timer = setTimeout(onTransitionDone, 1100);
    return () => clearTimeout(timer);
  }, [transitioning, onTransitionDone]);

  return (
    <div className="fixed inset-0 z-50 bg-cream overflow-y-auto visible-scrollbar">
      {transitioning ? (
        <div className="h-full flex flex-col items-center justify-center px-8">
          <p
            className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold fade-up"
            style={{ color: accentColor }}
          >
            {t("interlude_title")}
          </p>
          <p
            className="font-display italic text-2xl text-ink mt-3 fade-up text-center"
            style={{ animationDelay: "300ms" }}
          >
            {atmosphere.title}
          </p>
        </div>
      ) : (
        <div className="min-h-full px-6 py-10 max-w-md mx-auto">
          <button
            onClick={onClose}
            className="font-sans text-[11px] text-clay mb-8"
          >
            ← {t("return_to_todays_edit")}
          </button>

          <div className="fade-up">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: accentColor }}>
              {t("todays_atmosphere_title")}
            </p>
            <p className="font-display italic text-3xl text-ink mt-2">{atmosphere.title}</p>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "150ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("editorial_notes_title")}
            </p>
            {atmosphere.description.map((line, i) => (
              <p key={i} className="font-display italic text-[15px] text-ink leading-loose">
                {line}
              </p>
            ))}
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "300ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("listening_nearby_title")}
            </p>
            <div className="space-y-1.5">
              {atmosphere.artists.map((artist) => (
                <p key={artist} className="font-sans text-[13px] text-ink">{artist}</p>
              ))}
            </div>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "450ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("reading_nearby_title")}
            </p>
            <div className="space-y-4">
              {atmosphere.reading.map((book) => (
                <div key={book.title}>
                  <p className="font-sans text-[13px] text-ink font-medium">{book.author}</p>
                  <p className="font-display italic text-[13px] text-ink/80">{book.title}</p>
                  <p className="font-sans text-[11px] text-clay mt-0.5">{book.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "600ms" }}>
            <a
              href={spotifySearchUrl(atmosphere)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-line rounded-full px-5 py-2.5 font-sans text-[12px] text-ink"
              style={{ borderColor: accentColor }}
            >
              {t("continue_listening_label")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export type CareRitual = {
  icon: string;
  title: string;
  lines: string[];
};

// A single expandable "ritual" row — quiet by design. No film, no extra
// notes, just a title and a short instruction, in keeping with "no heavy
// accordion styling."
export function CareRitualRow({ ritual }: { ritual: CareRitual }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <span className="text-base shrink-0">{ritual.icon}</span>
        <span className="font-sans text-[13px] text-ink flex-1">{ritual.title}</span>
        <span
          className="text-clay/60 transition-transform inline-block shrink-0 text-sm"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
      </button>

      <div
        className="grid transition-all duration-400 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-3.5 pl-7 fade-up">
            {ritual.lines.map((line, i) => (
              <p key={i} className="font-sans text-[11px] text-clay leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
