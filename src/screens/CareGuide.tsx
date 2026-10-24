import { Eyebrow, CareRitualRow, type CareRitual } from "../components/UI";
import { CareReminders } from "../components/CareReminders";
import { getCareRecommendation } from "../lib/careRecommendation";
import { useLanguage } from "../lib/i18n";
import { Scissors, Droplets, Brush, Heart, Package, Flame } from "lucide-react";


/* 7: CARE TO EXTEND LIFE */
export function CareGuide() {
  const { t } = useLanguage();
  const { wearCount: careWearCount } = getCareRecommendation();
  const wears = [
    [t("wears_5"), t("impact_high"), "text-clay"],
    [t("wears_30"), t("impact_opt"), "text-ink"],
    [t("wears_100"), t("impact_low"), "text-[#8E3D52]"],
  ];

  const rituals: CareRitual[] = [
    { icon: <Droplets size={18} strokeWidth={1.25} />, title: t("ritual_hand_washing_title"), lines: [t("ritual_hand_washing_line1"), t("ritual_hand_washing_line2")] },
    { icon: <Flame size={18} strokeWidth={1.25} />, title: t("ritual_steaming_title"), lines: [t("ritual_steaming_line1")] },
    { icon: <Brush size={18} strokeWidth={1.25} />, title: t("ritual_brushing_title"), lines: [t("ritual_brushing_line1")] },
    { icon: <Heart size={18} strokeWidth={1.25} />, title: t("ritual_folding_title"), lines: [t("ritual_folding_line1")] },
    { icon: <Package size={18} strokeWidth={1.25} />, title: t("ritual_storage_title"), lines: [t("ritual_storage_line1")] },
    { icon: <Scissors size={18} strokeWidth={1.25} />, title: t("ritual_repair_title"), lines: [t("ritual_repair_line1")] },
  ];

  // Same real computation used elsewhere (next maintenance countdown from
  // actual recorded wear count), reframed here as reflective copy rather
  // than a functional recommendation.
  const nextMaintenanceIn = Math.max(2, 20 - (careWearCount % 20));

  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("care")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("designed_years")}
      </h2>
      <p className="text-[12px] text-clay font-sans mt-1 mb-5">{t("care_supporting_line")}</p>

      <div className="border-t border-line pt-5 mb-5 fade-up" style={{ animationDelay: "100ms" }}>
        <Eyebrow>{t("impact_per_wear")}</Eyebrow>
        <div className="flex justify-between mt-2">
          {wears.map(([label, tag, color]) => (
            <div key={label} className="text-center">
              <p className="font-sans text-[11px] text-ink">{label}</p>
              <p className={`font-sans text-[10px] font-semibold ${color}`}>{tag}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-5 mb-2 fade-up" style={{ animationDelay: "220ms" }}>
        <Eyebrow>{t("atelier_title")}</Eyebrow>
        <p className="font-sans text-[12px] text-ink/85 leading-relaxed mt-2 mb-1">
          {t("atelier_intro")}
        </p>
      </div>
      <div className="border-t border-line">
        {rituals.map((ritual, i) => (
          <CareRitualRow key={ritual.title} ritual={ritual} entranceDelayMs={340 + i * 80} />
        ))}
      </div>

      {/* Care Philosophy, a reflective close rather than a maintenance
          log. The wears-remaining figure is still a real computation from
          the recorded wear count, just framed gently. */}
      <div
        className="border-t border-line pt-5 mt-2 fade-up"
        style={{ animationDelay: `${340 + rituals.length * 80 + 150}ms` }}
      >
        <Eyebrow>{t("care_philosophy_title")}</Eyebrow>
        <p className="font-display italic text-[17px] text-ink leading-snug mt-2">
          {t("care_philosophy_line1")}
          <br />{t("care_philosophy_line2")}
          <br />{t("care_philosophy_line3")}
        </p>
        <p className="font-sans text-[11px] text-clay mt-4">
          {t("care_philosophy_maintenance_label")}
          <br />
          {t("care_philosophy_wears_remaining").replace("{n}", String(nextMaintenanceIn))}
        </p>
        <p className="font-display italic text-[13px] mt-5" style={{ color: "#A94C63" }}>
          "{t("care_philosophy_quote")}"
        </p>
      </div>

      <CareReminders />
    </div>
  );
}
