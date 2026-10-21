import { Eyebrow } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";


/* TERMS OF USE, same shell, same pattern as Privacy above. */
export function TermsOfUseScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("terms_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("terms_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("terms_subtitle")}
      </p>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("terms_section1_title")}
        </p>
        <ul className="space-y-1.5 mb-2">
          {(["terms_ownership_edit", "terms_ownership_update", "terms_ownership_transfer"] as TranslationKey[]).map((k) => (
            <li key={k} className="font-sans text-[12px] text-ink/80 flex items-start gap-1.5">
              <span className="text-clay shrink-0">·</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
        <p className="font-sans text-[11px] text-clay leading-relaxed">{t("terms_ownership_note")}</p>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("terms_section2_title")}
        </p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("terms_product_info")}</p>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("terms_section3_title")}
        </p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("terms_user_content")}</p>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("terms_section4_title")}
        </p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("terms_availability")}</p>
      </div>

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("terms_closing_quote")}
        </p>
      </div>
    </div>
  );
}
