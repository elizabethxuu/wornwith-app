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

  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("lifecycle_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1">{t("where_from")}</h2>
      <p className="font-sans text-[12px] text-clay mt-1 mb-3">{t("km_traveled")}</p>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {[
          { key: "place_nz" as const },
          { key: "place_italy" as const },
          { key: "place_portugal" as const },
          { key: "place_france" as const },
        ].map((bubble, i) => (
          <span
            key={bubble.key}
            style={{ animationDelay: `${i * 120}ms` }}
            className="pop-in text-[10px] uppercase tracking-[0.16em] font-sans text-clay border border-line px-2.5 py-1 rounded-full"
          >
            {t(bubble.key)}
          </span>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-line" />
        <div className="space-y-5">
          {stops.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setSelected(i)}
              style={{ animationDelay: `${480 + i * 150}ms` }}
              className="pop-in relative flex items-center gap-3 w-full text-left"
            >
              <div className={`absolute -left-6 w-4 h-4 rounded-full border ${selected === i ? "bg-[#8E3D52] border-[#8E3D52]" : "bg-paper border-clay/40"}`} />
              <span className={`w-6 flex justify-center ${selected === i ? "text-[#8E3D52]" : "text-clay"}`}>{s.icon}</span>
              <div>
                <p className={`font-sans text-[14px] font-medium ${selected === i ? "text-[#8E3D52]" : "text-ink"}`}>{s.title}</p>
                <p className="text-[12px] text-clay font-sans">{s.place}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ExpandableCard
        key={selected}
        title={activeDetail.cardTitle}
        rows={activeDetail.rows}
        learnMoreHref={activeDetail.learnMoreHref}
        learnMoreLabel={activeDetail.learnMoreLabel}
        onLearnMoreClick={activeDetail.onLearnMoreClick}
      />
    </div>
  );
}
