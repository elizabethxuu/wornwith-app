import { Eyebrow } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";

export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();

  const section = (titleKey: TranslationKey, itemKeys: TranslationKey[]) => (
    <div className="mt-6">
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
        {t(titleKey)}
      </p>
      <ul className="space-y-1.5">
        {itemKeys.map((k) => (
          <li key={k} className="font-sans text-[12px] text-ink/80 flex items-start gap-1.5">
            <span className="text-clay shrink-0">·</span>
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("privacy_eyebrow")}</Eyebrow>
      <h1 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("privacy_title")}
      </h1>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("privacy_subtitle")}
      </p>

      <div className="border-t border-line mt-6" />
      {section("privacy_s1_title", ["privacy_s1_a", "privacy_s1_b", "privacy_s1_c"])}

      <div className="border-t border-line mt-6" />
      {section("privacy_s2_title", ["privacy_s2_a", "privacy_s2_b", "privacy_s2_c", "privacy_s2_e", "privacy_s2_f", "privacy_s2_g", "privacy_s2_h", "privacy_s2_d"])}

      <div className="border-t border-line mt-6" />
      {section("privacy_s5_title", ["privacy_s5_a", "privacy_s5_b", "privacy_s5_c"])}
      <div className="border-t border-line mt-6" />
      {section("privacy_s3_title", ["privacy_s3_a", "privacy_s3_b", "privacy_s3_c"])}

      <div className="border-t border-line mt-6" />
      {section("privacy_s4_title", ["privacy_s4_a", "privacy_s4_b"])}

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("privacy_closing_quote")}
        </p>
      </div>
    </div>
  );
}
