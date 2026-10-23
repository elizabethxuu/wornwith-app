import { useState } from "react";
import { Eyebrow, ExpandableCard } from "../components/UI";
import { useLanguage } from "../lib/i18n";
import { STOP_ACCENTS } from "../lib/mapFocus";
import { JOURNEY } from "../lib/passportRecord";
import { Shirt, Sprout, Spool, Scissors } from "lucide-react";


/* 5: PRODUCT LIFECYCLE */
export function ProductLifecycle({ onViewChapter, onOpenMapStop }: { onViewChapter?: () => void; onOpenMapStop?: (stop: number) => void } = {}) {
  const { t, lang } = useLanguage();
  const stops = [
    { icon: <Sprout size={18} strokeWidth={1.25} />, title: t("wool_farming"), place: t("place_full_nz_short") },
    { icon: <Spool size={18} strokeWidth={1.25} />, title: t("spinning_weaving"), place: t("place_full_italy") },
    { icon: <Scissors size={18} strokeWidth={1.25} />, title: t("cutting_construction"), place: t("place_full_portugal") },
    { icon: <Shirt size={18} strokeWidth={1.25} />, title: t("with_you_now"), place: t("place_full_paris") },
  ];
  // The timeline's last stop ("With you now") is where the garment
  // currently is, so that's the sensible default selection, but every
  // row is tappable, and the card beneath adapts to whichever chapter is
  // selected rather than always describing the wool farm.
  const [selected, setSelected] = useState(stops.length - 1);

  const stopDetails = [
    {
      cardTitle: t("wool_farming_card_title"),
      rows: [
        [t("wool_farming_cert_label"), t("wool_farming_cert_value")],
        [t("wool_farming_region_label"), t("wool_farming_region_value")],
        [t("wool_farming_climate_label"), t("wool_farming_climate_value")],
        [t("wool_farming_season_label"), t("wool_farming_season_value")],
      ] as [string, string][],
      learnMoreLabel: t("learn_wool_farm"),
      learnMoreHref: "https://responsiblewool.org",
    },
    {
      cardTitle: t("manufacturing_card_title"),
      rows: [
        [t("manufacturing_mill_label"), t("manufacturing_mill_value")],
        [t("manufacturing_family_label"), t("manufacturing_family_value")],
        [t("manufacturing_since_label"), t("manufacturing_since_value")],
        [t("manufacturing_renewable_label"), t("manufacturing_renewable_value")],
      ] as [string, string][],
      learnMoreLabel: undefined,
      learnMoreHref: undefined,
    },
    {
      cardTitle: t("atelier_card_title"),
      rows: [
        [t("atelier_name_label"), t("atelier_name_value")],
        [t("atelier_founded_label"), t("atelier_founded_value")],
        [t("atelier_specialism_label"), t("atelier_specialism_value")],
        [t("atelier_hands_label"), t("atelier_hands_value")],
      ] as [string, string][],
      learnMoreLabel: undefined,
      learnMoreHref: undefined,
    },
    {
      cardTitle: t("chapter_card_title"),
      rows: [
        [t("chapter_status_label"), t("chapter_status_value")],
        [t("chapter_verified_label"), t("owned_since_date")],
        [t("chapter_owner_label"), t("chapter_owner_value")],
      ] as [string, string][],
      learnMoreLabel: t("view_this_chapter"),
      onLearnMoreClick: onViewChapter,
    },
  ];

  const activeDetail = stopDetails[selected];
  // Each leg's distance comes from the passport record, so the timeline
  // always adds up to the headline total.
  const numLocale = lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-PT" : "en-US";
  const legs = JOURNEY.legsKm.map((km, i) => `≈ ${km.toLocaleString(numLocale)} km${i === 0 ? ` · ${t("by_sea")}` : ""}`);
  const blurbs = [t("stop_blurb_nz"), t("stop_blurb_italy"), t("stop_blurb_portugal"), t("stop_blurb_paris")];

  // One continuous, unhurried reveal: heading, distance, places, then the
  // timeline line draws down and each stop settles in after it.
  const at = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div className="h-full px-6 pt-8 pb-10">
      <div className="reveal-soft" style={at(0)}>
        <Eyebrow>{t("lifecycle_eyebrow")}</Eyebrow>
      </div>
      <h2 className="reveal-soft font-display italic text-[28px] leading-tight text-ink mt-3" style={at(120)}>{t("where_from")}</h2>
      <p className="reveal-soft font-sans text-[12px] text-clay mt-2 mb-7" style={at(240)}>{t("km_traveled")}</p>
      <div className="flex gap-2 flex-wrap mb-9">
        {[
          // White chips ringed in each country's pin color from the map;
          // tapping one opens the map on that pin.
          { key: "place_nz" as const },
          { key: "place_italy" as const },
          { key: "place_portugal" as const },
          { key: "place_france" as const },
        ].map((bubble, i) => (
          <button
            key={bubble.key}
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenMapStop?.(i); }}
            aria-label={`${t(bubble.key)}, ${t("show_on_map")}`}
            style={{ ...at(380 + i * 110), ["--pin" as string]: STOP_ACCENTS[i] }}
            className="reveal-soft country-chip text-[10px] uppercase tracking-[0.18em] font-sans font-semibold px-3 py-1.5 rounded-full"
          >
            {t(bubble.key)}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-line line-draw" style={at(820)} />
        <div className="space-y-1">
          {stops.map((s, i) => (
            <div key={s.title}>
            <button
              onClick={() => setSelected(i)}
              style={at(900 + i * 220)}
              className="reveal-soft relative flex items-center gap-4 w-full text-left"
            >
              <span
                className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  color: selected === i ? "#FFFFFF" : `color-mix(in srgb, ${STOP_ACCENTS[i]} 65%, rgb(var(--c-clay)))`,
                  background: selected === i ? STOP_ACCENTS[i] : `linear-gradient(color-mix(in srgb, ${STOP_ACCENTS[i]} 6%, transparent), color-mix(in srgb, ${STOP_ACCENTS[i]} 6%, transparent)), rgb(var(--c-paper))`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${STOP_ACCENTS[i]} ${selected === i ? 100 : 50}%, transparent)${selected === i ? `, 0 0 0 4px color-mix(in srgb, ${STOP_ACCENTS[i]} 14%, transparent)` : ""}`,
                }}
              >
                {s.icon}
              </span>
              <div>
                <p className={`font-sans text-[14px] text-ink ${selected === i ? "font-semibold" : "font-medium"}`}>{s.title}</p>
                <p className="text-[12px] text-clay font-sans mt-0.5">{s.place}</p>
              </div>
            </button>
            {i < stops.length - 1 && (
              <p className="reveal-soft pl-[52px] py-3 font-display italic text-[13px] text-clay/80" style={at(1000 + i * 220)}>{legs[i]}</p>
            )}
            </div>
          ))}
        </div>
      </div>

      {/* The selected stop, told in brief: place, title, one line of story
          and its key fact, with the rest one tap away. */}
        <div key={selected} className="fade-up mt-10 rounded-card border border-line p-5" style={{ backgroundImage: `linear-gradient(160deg, color-mix(in srgb, ${STOP_ACCENTS[selected]} 7%, transparent), transparent 60%)` }}>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em]" style={{ color: `color-mix(in srgb, ${STOP_ACCENTS[selected]} 75%, rgb(var(--c-ink)))` }}>{stops[selected].place}</p>
          <h3 className="font-display italic text-[22px] leading-snug text-ink mt-1.5">{activeDetail.cardTitle}</h3>
          <p className="font-sans text-[13px] leading-relaxed text-clay mt-2">{blurbs[selected]}</p>
          <div className="mt-4 pt-3 border-t border-line flex items-baseline justify-between gap-3">
            <span className="font-sans text-[11px] text-clay">{activeDetail.rows[0][0]}</span>
            <span className="font-sans text-[12px] text-ink text-right">{activeDetail.rows[0][1]}</span>
          </div>
          <ExpandableCard title={t("more_details")} rows={activeDetail.rows.slice(1)} learnMoreHref={activeDetail.learnMoreHref} learnMoreLabel={activeDetail.learnMoreLabel} onLearnMoreClick={activeDetail.onLearnMoreClick} />
        </div>
    </div>
  );
}
