import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { takePendingOpen, OPEN, OPEN_OWN, collectedStamps, onOpenStampsPage, onStampsChanged, openStampsPage, openYourStampsPage, onOpenYourStampsPage, STAMP_COUNT, loadOwnerStamps, addOwnerStamp, removeOwnerStamp, stampDate, MAX_PLACE, MAX_NOTE, type OwnerStamp } from "../lib/stamps";
import { haptic, paperSound } from "../lib/touches";
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

export const STAMPS: Stamp[] = [
  { country: "AOTEAROA · NEW ZEALAND", city: "Canterbury", stage: "stamp_grown", shape: "circle", tilt: -8 },
  { country: "ITALIA", city: "Biella", stage: "stamp_spun", shape: "rect", tilt: 6 },
  { country: "PORTUGAL", city: "Porto", stage: "stamp_sewn", shape: "hex", tilt: -4 },
  { country: "FRANCE", city: "Paris", stage: "stamp_arrived", shape: "oval", tilt: 9, date: "04 · 2026" },
];

type StampFace = Pick<Stamp, "country" | "city" | "shape" | "tilt" | "date">;

// Longer place names (owner stamps can say anything) shrink to fit.
const topStyle = (text: string, spacing: number, width: number) => {
  // Shrink the letter spacing first, then the size, until the line fits.
  const len = Math.max(text.length, 1);
  const ls = Math.max(0.8, Math.min(spacing, width / len - 5));
  const size = Math.min(7.2, (width / len - ls) * 1.45);
  return { fontSize: size, letterSpacing: ls };
};
const fit = (base: number, text: string, room = 9) => Math.min(base, (base * room) / Math.max(text.length, 1) * 1.15);

export function StampArt({ s, color, label }: { s: StampFace; color: string; label: string }) {
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
            <text x="60" y="67" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: fit(15, s.city, 10), fontWeight: 600 }}>{s.city}</text>
          </>
        )}
        {s.shape === "rect" && (
          <>
            <rect x="10" y="22" width="100" height="76" rx="6" strokeWidth="2.2" />
            <rect x="16" y="28" width="88" height="64" rx="3" strokeWidth="0.9" />
            <text x="60" y="44" textAnchor="middle" fill={color} stroke="none" style={{ ...small, ...topStyle(s.country, 3, 80) }}>{s.country}</text>
            <text x="60" y="68" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: fit(20, s.city, 8), fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="83" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
          </>
        )}
        {s.shape === "hex" && (
          <>
            <polygon points="60,6 107,33 107,87 60,114 13,87 13,33" strokeWidth="2.2" strokeLinejoin="round" />
            <polygon points="60,14 100,37 100,83 60,106 20,83 20,37" strokeWidth="0.9" strokeLinejoin="round" />
            <text x="60" y="44" textAnchor="middle" fill={color} stroke="none" style={{ ...small, ...topStyle(s.country, 2.6, 64) }}>{s.country}</text>
            <text x="60" y="67" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: fit(21, s.city, 6), fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="84" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
          </>
        )}
        {s.shape === "oval" && (
          <>
            <ellipse cx="60" cy="60" rx="56" ry="42" strokeWidth="2.2" />
            <ellipse cx="60" cy="60" rx="49" ry="35" strokeWidth="0.9" />
            <text x="60" y="40" textAnchor="middle" fill={color} stroke="none" style={{ ...small, ...topStyle(s.country, 3, 66) }}>{s.country}</text>
            <text x="60" y="62" textAnchor="middle" fill={color} stroke="none" style={{ fontFamily: serif, fontStyle: "italic", fontSize: fit(19, s.city, 8), fontWeight: 600 }}>{s.city}</text>
            <text x="60" y="76" textAnchor="middle" fill={color} stroke="none" style={small}>{label}</text>
            {s.date && <text x="60" y="88" textAnchor="middle" fill={color} stroke="none" style={{ ...small, fontSize: 6.4, letterSpacing: 1.4, fontWeight: 500 }}>{s.date}</text>}
          </>
        )}
      </g>
    </svg>
  );
}

// The hidden last page. Opened from the End screen's faint mark, from a
// triple tap on the logo, or from "Passport complete" once all four are
// collected. Collected stamps thunk down; the rest wait as faint dashed
// outlines that lead to the Journey, where they can be found.
export function StampsPage({ onGoTo }: { onGoTo: (screen: number) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [collected, setCollected] = useState<number[]>(() => collectedStamps());

  const [owned, setOwned] = useState<OwnerStamp[]>(() => loadOwnerStamps());
  useEffect(() => {
    const show = () => { setCollected(collectedStamps()); setOwned(loadOwnerStamps()); setOpen(true); paperSound(); };
    if (takePendingOpen(OPEN)) show();
    return onOpenStampsPage(show);
  }, []);
  useEffect(() => onStampsChanged(() => { setCollected(collectedStamps()); setOwned(loadOwnerStamps()); }), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timers = collected.map((_, k) => setTimeout(() => haptic(10), 250 + k * 260 + 250));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const go = (screen: number) => { setOpen(false); onGoTo(screen); };
  const complete = collected.length === STAMP_COUNT;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("stamps_page_title")} className="fixed inset-0 z-50 bg-paper overflow-y-auto stamps-page-in">
      <div className="max-w-md mx-auto px-6 pb-10" style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}>
        <div className="flex justify-end">
          <button onClick={() => setOpen(false)} aria-label={t("close_label")} className="w-10 h-10 -mr-2 flex items-center justify-center text-ink">
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay mt-2">{t("stamps_eyebrow")}</p>
        <h2 className="font-display italic text-[30px] leading-tight text-ink mt-2">{t("stamps_page_title")}</h2>
        <p className="font-sans text-[12px] text-clay mt-2">
          {complete ? t("stamps_complete") : t("stamps_progress").replace("{n}", String(collected.length)).replace("{total}", String(STAMP_COUNT))}
        </p>

        <div className="stamp-page mt-6 rounded-card border border-line px-4 py-6 grid grid-cols-2 gap-x-2 gap-y-2">
          {STAMPS.map((s, i) => {
            const have = collected.includes(i);
            const order = collected.indexOf(i);
            return have ? (
              <button
                key={s.city}
                type="button"
                onClick={() => { requestMapStop(i); go(7); }}
                aria-label={`${s.city}, ${t(s.stage)}. ${t("show_on_map")}`}
                className="stamp stamp-in aspect-square w-full max-w-[150px] mx-auto"
                style={{ ["--tilt" as string]: `${s.tilt}deg`, animationDelay: `${250 + order * 260}ms`, marginTop: i % 2 ? 14 : 0 }}
              >
                <StampArt s={s} color={`color-mix(in srgb, ${STOP_ACCENTS[i]} 78%, #3B2A22)`} label={t(s.stage)} />
              </button>
            ) : (
              <button
                key={s.city}
                type="button"
                onClick={() => go(2)}
                aria-label={`${s.city}, ${t("stamps_missing")}`}
                className="aspect-square w-full max-w-[150px] mx-auto rounded-full border border-dashed border-line flex flex-col items-center justify-center text-center"
                style={{ marginTop: i % 2 ? 14 : 0 }}
              >
                <span className="font-display italic text-[15px] text-clay/70">{s.city}</span>
                <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-clay/60 mt-1">{t("stamps_missing")}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center font-sans text-[10px] text-clay">{complete ? t("stamps_hint") : t("stamps_how")}</p>
        {/* The other stamp page: the owner's own. */}
        <button
          onClick={() => { setOpen(false); setTimeout(openYourStampsPage, 120); }}
          className="mt-10 w-full flex items-center justify-between rounded-card border border-line px-5 py-4 text-left"
        >
          <span>
            <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("owner_stamps_title")}</span>
            <span className="block font-display italic text-[17px] text-[#8E3D52] mt-1">
              {owned.length ? t("owner_stamps_count").replace("{n}", String(owned.length)) : t("owner_stamps_empty_link")}
            </span>
          </span>
          <span className="text-clay">→</span>
        </button>
        <p className="mt-10 text-center font-display italic text-[14px] text-clay">{t("stamps_secret")}</p>
      </div>
    </div>,
    document.body
  );
}

// Your stamps get a page of their own, hidden on the Ownership screen and
// linked from the passport's last page (and back).
export function YourStampsPage() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [owned, setOwned] = useState<OwnerStamp[]>(() => loadOwnerStamps());
  useEffect(() => {
    const show = () => { setOwned(loadOwnerStamps()); setOpen(true); paperSound(); };
    if (takePendingOpen(OPEN_OWN)) show();
    return onOpenYourStampsPage(show);
  }, []);
  useEffect(() => onStampsChanged(() => setOwned(loadOwnerStamps())), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("owner_stamps_title")} className="fixed inset-0 z-50 bg-paper overflow-y-auto stamps-page-in">
      <div className="max-w-md mx-auto px-6 pb-10" style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}>
        <div className="flex justify-end">
          <button onClick={() => setOpen(false)} aria-label={t("close_label")} className="w-10 h-10 -mr-2 flex items-center justify-center text-ink">
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8E3D52] mt-2">{t("owner_stamps_eyebrow")}</p>
        <h2 className="font-display italic text-[30px] leading-tight text-ink mt-2">{t("owner_stamps_title")}</h2>
        <OwnerStamps owned={owned} />
        {/* Back to the coat's own journey stamps. */}
        <button
          onClick={() => { setOpen(false); setTimeout(openStampsPage, 120); }}
          className="mt-10 w-full flex items-center justify-between rounded-card border border-line px-5 py-4 text-left"
        >
          <span className="text-clay">←</span>
          <span className="text-right">
            <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("stamps_eyebrow")}</span>
            <span className="block font-display italic text-[17px] text-ink mt-1">{t("owner_stamps_journey_link")}</span>
          </span>
        </button>
        <p className="mt-10 text-center font-display italic text-[14px] text-clay">{t("owner_stamps_secret")}</p>
      </div>
    </div>,
    document.body
  );
}

// Your own stamps: places the coat has been with you, and any carried over
// from a previous owner. Added right here; each thunks down when stamped.
const YOUR_INK = "#8E3D52";
const PREVIOUS_INK = "#6D556A";

function OwnerStamps({ owned }: { owned: OwnerStamp[] }) {
  const { t } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [fresh, setFresh] = useState<string | null>(null);

  const stampIt = (e: React.FormEvent) => {
    e.preventDefault();
    const made = addOwnerStamp({ place, note, month });
    if (!made) return;
    setFresh(made.id);
    setPlace(""); setNote(""); setMonth(thisMonth); setAdding(false);
    setTimeout(() => haptic(18), 260);
  };

  return (
    <section className="mt-2" aria-label={t("owner_stamps_title")}>
      <p className="font-sans text-[12px] text-clay leading-relaxed">{t("owner_stamps_sub")}</p>
      <div className="stamp-page mt-4 rounded-card border border-line px-4 py-6 grid grid-cols-2 gap-x-2 gap-y-4">
        {owned.map((o, i) => (
          <figure key={o.id} className="flex flex-col items-center" style={{ marginTop: i % 2 ? 14 : 0 }}>
            <div
              className={`stamp ${o.id === fresh ? "stamp-in" : "stamp-still"} aspect-square w-full max-w-[150px]`}
              style={{ ["--tilt" as string]: `${o.tilt}deg` }}
            >
              <StampArt
                s={{ country: o.from ? o.from.toUpperCase() : t("owner_stamp_top"), city: o.place, shape: o.shape, tilt: o.tilt }}
                color={o.from ? PREVIOUS_INK : YOUR_INK}
                label={stampDate(o.month)}
              />
            </div>
            {(o.note || o.from) && (
              <figcaption className="mt-1 text-center font-display italic text-[12px] text-clay leading-snug max-w-[140px]">
                {o.note}{o.note && o.from ? " · " : ""}{o.from ? t("owner_stamp_from").replace("{name}", o.from) : ""}
              </figcaption>
            )}
            {!o.from && (
              <button onClick={() => removeOwnerStamp(o.id)} className="mt-0.5 font-sans text-[9px] uppercase tracking-[0.18em] text-clay/60 hover:text-clay py-1">
                {t("owner_stamp_remove")}
              </button>
            )}
          </figure>
        ))}
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="aspect-square w-full max-w-[150px] mx-auto rounded-full border border-dashed border-[#8E3D52]/40 flex flex-col items-center justify-center text-[#8E3D52]"
            style={{ marginTop: owned.length % 2 ? 14 : 0 }}
          >
            <span className="font-display italic text-[26px] leading-none">+</span>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] mt-2">{t("owner_stamp_add")}</span>
          </button>
        )}
      </div>
      {adding && (
        <form onSubmit={stampIt} className="mt-4 rounded-card border border-line p-4 space-y-3 fade-up">
          <label className="block">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("owner_stamp_place")}</span>
            <input
              autoFocus
              required
              value={place}
              maxLength={MAX_PLACE}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={t("owner_stamp_place_ph")}
              className="mt-1 w-full border-b border-line bg-transparent py-2 font-display italic text-[20px] text-ink outline-none focus:border-[#8E3D52]"
            />
          </label>
          <div className="flex gap-3">
            <label className="block w-[44%]">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("owner_stamp_when")}</span>
              <input
                type="month"
                required
                value={month}
                max={thisMonth}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-1 w-full border-b border-line bg-transparent py-2 font-sans text-[13px] text-ink outline-none"
              />
            </label>
            <label className="block flex-1">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("owner_stamp_note")}</span>
              <input
                value={note}
                maxLength={MAX_NOTE}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("owner_stamp_note_ph")}
                className="mt-1 w-full border-b border-line bg-transparent py-2 font-sans text-[13px] text-ink outline-none"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={() => setAdding(false)} className="font-sans text-[12px] text-clay px-3 py-2">{t("cancel")}</button>
            <button type="submit" disabled={!place.trim()} className="rounded-full bg-ink text-cream px-5 py-2.5 font-sans text-[12px] disabled:opacity-40">{t("owner_stamp_submit")}</button>
          </div>
        </form>
      )}
    </section>
  );
}
