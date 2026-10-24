import { useEffect, useId, useRef, useState } from "react";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { STOP_ACCENTS, requestMapStop } from "../lib/mapFocus";

// Where the coat has been, as the stamps a real passport collects: one per
// stop, inked in that stop's map color, each a different shape and set at
// its own slight angle. They stamp down one after another the first time
// they scroll into view, and each opens the Story map on its pin.
// Country names are in each country's own language, as on real stamps.

type Stamp = {
  country: string;
  city: string;
  stage: TranslationKey;
  shape: "circle" | "rect" | "hex" | "oval";
  tilt: number;
  date?: string;
};

const STAMPS: Stamp[] = [
  { country: "AOTEAROA · NEW ZEALAND", city: "Canterbury", stage: "stamp_grown", shape: "circle", tilt: -8 },
  { country: "ITALIA", city: "Biella", stage: "stamp_spun", shape: "rect", tilt: 6 },
  { country: "PORTUGAL", city: "Porto", stage: "stamp_sewn", shape: "hex", tilt: -4 },
  { country: "FRANCE", city: "Paris", stage: "stamp_arrived", shape: "oval", tilt: 9, date: "04 · 2026" },
];

function StampArt({ s, color, label }: { s: Stamp; color: string; label: string }) {
  const id = useId().replace(/:/g, "");
  const ink = `ink-${id}`;
  const arcTop = `top-${id}`;
  const arcBottom = `bot-${id}`;
  const serif = "'Cormorant Garamond', serif";
  const sans = "'Inter', sans-serif";
  const small = { fontFamily: sans, fontSize: 7.2, letterSpacing: 1.6, fontWeight: 600 } as const;

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <defs>
        {/* Uneven ink: a faint wobble on the edges and a speckled dropout. */}
        <filter id={ink} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={s.tilt + 20} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed={s.tilt + 7} result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.45" result="m" />
          <feComposite in="d" in2="m" operator="in" />
        </filter>
        <path id={arcTop} d="M 22 60 A 38 38 0 0 1 98 60" />
        <path id={arcBottom} d="M 18 60 A 42 42 0 0 0 102 60" />
      </defs>
      <g filter={`url(#${ink})`} fill="none" stroke={color} style={{ color }}>
        {s.shape === "circle" && (
          <>
            <circle cx="60" cy="60" r="54" strokeWidth="2.2" />
            <circle cx="60" cy="60" r="47" strokeWidth="0.9" />
            <text fill={color} stroke="none" style={{ ...small, fontSize: 6.4, letterSpacing: 1.2 }}>
              <textPath href={`#${arcTop}`} startOffset="50%" textAnchor="middle">{s.country}</textPath>
            </text>
            <text fill={color} stroke="none" style={small} dy="7">
              <textPath href={`#${arcBottom}`} startOffset="50%" textAnchor="middle">{label}</textPath>
            </text>
            <line x1="32" y1="50" x2="88" y2="50" strokeWidth="0.8" />
            <line x1="32" y1="75" x2="88" y2="75" strokeWidth="0.8" />
            <text x="60" y="67" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, fontWeight: 600 }}>{s.city}</text>
          </>
        )}
        {s.shape === "rect" && (
          <>
            <rect x="10" y="22" width="100" height="76" rx="6" strokeWidth="2.2" />
            <rect x="16" y="28" width="88" height="64" rx="3" strokeWidth="0.9" />
            <text x="60" y="44" textAnchor="middle" fill={color} stroke="none" style={{ ...small, letterSpacing: 3 }}>{s.country}</text>
            <text x="60" y="68" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 20, fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="83" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
          </>
        )}
        {s.shape === "hex" && (
          <>
            <polygon points="60,6 107,33 107,87 60,114 13,87 13,33" strokeWidth="2.2" strokeLinejoin="round" />
            <polygon points="60,14 100,37 100,83 60,106 20,83 20,37" strokeWidth="0.9" strokeLinejoin="round" />
            <text x="60" y="44" textAnchor="middle" fill={color} stroke="none" style={{ ...small, letterSpacing: 2.6 }}>{s.country}</text>
            <text x="60" y="67" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 21, fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="84" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
          </>
        )}
        {s.shape === "oval" && (
          <>
            <ellipse cx="60" cy="60" rx="56" ry="42" strokeWidth="2.2" />
            <ellipse cx="60" cy="60" rx="49" ry="35" strokeWidth="0.9" />
            <text x="60" y="40" textAnchor="middle" fill={color} stroke="none" style={{ ...small, letterSpacing: 3 }}>{s.country}</text>
            <text x="60" y="62" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: 19, fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="76" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
            {s.date && <text x="60" y="88" textAnchor="middle" fill={color} stroke="none" style={{ ...small, fontSize: 6.4, letterSpacing: 1.4, fontWeight: 500 }}>{s.date}</text>}
          </>
        )}
      </g>
    </svg>
  );
}

export function PassportStamps({ onGoTo }: { onGoTo?: (screen: number) => void }) {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [inked, setInked] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInked(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInked(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mt-8" aria-label={t("stamps_title")}>
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink">{t("stamps_title")}</p>
      <div className="stamp-page mt-3 rounded-card border border-line px-4 py-5 grid grid-cols-2 gap-x-2 gap-y-1">
        {STAMPS.map((s, i) => (
          <button
            key={s.city}
            type="button"
            onClick={(e) => { e.stopPropagation(); requestMapStop(i); onGoTo?.(7); }}
            aria-label={`${s.city}, ${t(s.stage)}. ${t("show_on_map")}`}
            className={`stamp ${inked ? "stamp-in" : ""} aspect-square w-full max-w-[150px] mx-auto`}
            style={{ ["--tilt" as string]: `${s.tilt}deg`, animationDelay: `${i * 260}ms`, marginTop: i % 2 ? 14 : 0 }}
          >
            <StampArt s={s} color={`color-mix(in srgb, ${STOP_ACCENTS[i]} 78%, #3B2A22)`} label={t(s.stage)} />
          </button>
        ))}
      </div>
      <p className="mt-2 text-center font-sans text-[10px] text-clay">{t("stamps_hint")}</p>
    </section>
  );
}
