import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";
import { useLanguage } from "../lib/i18n";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] tracking-[0.18em] uppercase text-blush-deep font-sans font-semibold">
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
const highlightedCountries = ["New Zealand", "Italy", "Portugal", "France"];
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
      <div className="w-full bg-paper border border-line rounded-card overflow-hidden">
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
                  const isHighlighted = highlightedCountries.includes(geo.properties.name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHighlighted ? "#E7A6B4" : "#F1E9EA"}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
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
                stroke="#C97A8C"
                strokeWidth={1.3}
                strokeLinecap="round"
                pathLength={1}
                style={{
                  strokeDasharray: "1px",
                  strokeDashoffset: drawn ? 0 : 1,
                  transition: `stroke-dashoffset 0.9s ease ${i * 0.35}s`,
                }}
              />
            ))}

            {journeyStops.map((s, i) => (
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
                {s.active && (
                  <circle r={8} fill="#C97A8C" fillOpacity={0.25}>
                    <animate attributeName="r" values="6;10;6" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="fill-opacity" values="0.35;0.1;0.35" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={selected === i ? 7 : s.active ? 5 : 4}
                  fill={s.active || selected === i ? "#C97A8C" : "#FFFFFF"}
                  stroke="#C97A8C"
                  strokeWidth={1.3}
                  style={{ pointerEvents: "none" }}
                />
                {selected === i && (
                  <circle
                    r={9}
                    fill="none"
                    stroke="#C97A8C"
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
                    stroke="#C97A8C"
                    strokeWidth={0.75}
                    strokeOpacity={0.5}
                  />
                )}
                <text
                  x={s.dx}
                  y={s.dy}
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  onClick={() => setSelected(i)}
                  style={{
                    cursor: "pointer",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontWeight: s.active || selected === i ? 600 : 500,
                    fontSize: s.active || selected === i ? 15 : 13,
                    fill: s.active || selected === i ? "#C97A8C" : "#2B2622",
                  }}
                >
                  {t(s.labelKey)}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tap-to-reveal detail card for whichever stop is selected */}
      <div className="mt-2.5 bg-blush-pale/40 rounded-xl px-3.5 py-3 fade-up" key={selected}>
        <div className="flex items-center gap-2 mb-1">
          {stop.icon && <span className="text-base">{stop.icon}</span>}
          <p className="font-sans text-[11px] font-semibold text-ink">{t(stop.placeKey)}</p>
        </div>
        <p className="font-sans text-[11px] text-clay leading-relaxed">{t(stop.blurbKey)}</p>
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
          className="text-blush-deep transition-transform inline-block"
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

export type LifecycleEntry = { year: string; event: string };

export function LifecycleTimeline({
  title,
  entries,
  projectedLabel,
}: {
  title: string;
  entries: LifecycleEntry[];
  projectedLabel?: string;
}) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="mt-6">
      <Eyebrow>{title}</Eyebrow>
      <div className="relative pl-5 mt-3">
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
        <div className="space-y-4">
          {entries.map((e, i) => {
            const isFuture = Number(e.year) > currentYear;
            return (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-5 top-[3px] w-2.5 h-2.5 rounded-full border-2 border-paper ${
                    isFuture ? "bg-paper border-blush" : "bg-blush-deep"
                  }`}
                  style={isFuture ? { boxShadow: "inset 0 0 0 1.5px #C97A8C" } : undefined}
                />
                <p
                  className={`font-display italic text-sm leading-none ${
                    isFuture ? "text-clay" : "text-blush-deep"
                  }`}
                >
                  {e.year}
                </p>
                <p className={`font-sans text-[12px] mt-0.5 ${isFuture ? "text-clay" : "text-ink"}`}>
                  {e.event}
                  {isFuture && projectedLabel && (
                    <span className="text-[9px] text-clay/80 ml-1.5">· {projectedLabel}</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
