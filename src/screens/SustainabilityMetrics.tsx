import { Eyebrow, Donut, Pill, ExpandableCard } from "../components/UI";
import { useLanguage } from "../lib/i18n";


/* 8: SUSTAINABILITY METRICS */
export function SustainabilityMetrics() {
  const { t } = useLanguage();
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("sustainability")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1">{t("impact_metrics")}</h2>
      <p className="text-[11px] text-clay font-sans mt-1">{t("impact_supporting_line")}</p>
      <p className="text-[10px] text-clay font-sans mt-2 mb-4 leading-relaxed">{t("impact_illustrative_note")}</p>
      <div className="flex justify-around mb-5">
        <Donut percent={30} label="CO₂" sublabel={t("vs_avg")} color="#8E3D52" />
        <Donut percent={80} label="H₂O" sublabel={t("recycled_water")} color="#2B2622" />
      </div>
      <div className="space-y-3 mb-4">
        <Pill label={t("recyclability")} percent={92} color="#8E3D52" />
        <Pill label={t("renewable_energy")} percent={78} color="#B7727F" />
        <Pill label={t("ethical_sourcing")} percent={100} color="#2B2622" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["7.9kg", t("co2_saved")], ["2,400L", t("water_saved")], ["Top 10%", t("top_10")]].map(([v, l]) => (
          <div key={l} className="border-y border-line py-3 text-center">
            <p className="font-display italic text-[20px] leading-none text-ink">{v}</p>
            <p className="text-[9px] font-sans text-clay uppercase tracking-[0.18em] mt-1.5">{l}</p>
          </div>
        ))}
      </div>

      <ExpandableCard
        title={t("env_performance_title")}
        bodyText={t("env_performance_body")}
      >
        <ul className="space-y-2 mb-1">
          {[
            [t("env_metric_carbon_value"), t("env_metric_carbon")],
            [t("env_metric_recyclable_value"), t("env_metric_recyclable")],
            [t("env_metric_renewable_value"), t("env_metric_renewable")],
            [t("env_metric_sourced_value"), t("env_metric_sourced")],
            [t("env_metric_water_value"), t("env_metric_water")],
            [t("env_metric_service_value"), t("env_metric_service")],
          ].map(([value, label]) => (
            <li key={label} className="flex items-baseline gap-2 font-sans text-[12px] text-ink/85">
              <span className="shrink-0 w-1 h-1 rounded-full bg-[#8E3D52] translate-y-[-3px]" />
              <span>
                <span className="font-semibold text-ink">{value}</span> {label}
              </span>
            </li>
          ))}
        </ul>
      </ExpandableCard>
    </div>
  );
}
