import { useState } from "react";
import { Eyebrow, ExpandableCard } from "../components/UI";
import { useLanguage } from "../lib/i18n";
import { Shirt, Sprout, Spool, Scissors } from "lucide-react";


/* 5: PRODUCT LIFECYCLE */
export function ProductLifecycle({ onViewChapter }: { onViewChapter?: () => void } = {}) {
  const { t } = useLanguage();
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
      <div className="flex gap-2 mb-12 flex-wrap">
        {[
          // Each country keeps its own soft tint and a highlighted ring,
          // drawn from the passport's palette; the label stays dark brown.
          { key: "place_nz" as const, rgb: "143 166 136" },       // sage, Canterbury pasture
          { key: "place_italy" as const, rgb: "185 138 74" },     // warm bronze, Biella wool
          { key: "place_portugal" as const, rgb: "85 107 138" },  // azulejo blue, Porto
          { key: "place_france" as const, rgb: "201 122 140" },   // blush, Paris
        ].map((bubble, i) => (
          <span
            key={bubble.key}
            style={{ ...at(380 + i * 110), ["--chip" as string]: bubble.rgb }}
            className="reveal-soft country-chip text-[10px] uppercase tracking-[0.18em] font-sans font-semibold px-3 py-1.5 rounded-full"
          >
            {t(bubble.key)}
          </span>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line line-draw" style={at(820)} />
        <div className="space-y-9">
          {stops.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSelected(i)}
              style={at(900 + i * 220)}
              className="reveal-soft relative flex items-center gap-4 w-full text-left"
            >
              <div className={`absolute -left-6 w-4 h-4 rounded-full border transition-colors duration-500 ${selected === i ? "bg-[#8E3D52] border-[#8E3D52]" : "bg-paper border-clay/40"}`} />
              <span className={`w-6 flex justify-center transition-colors duration-500 ${selected === i ? "text-[#8E3D52]" : "text-clay"}`}>{s.icon}</span>
              <div>
                <p className={`font-sans text-[14px] font-medium transition-colors duration-500 ${selected === i ? "text-[#8E3D52]" : "text-ink"}`}>{s.title}</p>
                <p className="text-[12px] text-clay font-sans mt-0.5">{s.place}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="reveal-soft mt-10" style={at(1880)}>
      <ExpandableCard
        key={selected}
        title={activeDetail.cardTitle}
        rows={activeDetail.rows}
        learnMoreHref={activeDetail.learnMoreHref}
        learnMoreLabel={activeDetail.learnMoreLabel}
        onLearnMoreClick={activeDetail.onLearnMoreClick}
      />
      </div>
    </div>
  );
}
