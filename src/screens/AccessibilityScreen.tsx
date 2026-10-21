import { Eyebrow } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";


/* ACCESSIBILITY, same editorial shell as Privacy/Terms. */
export function AccessibilityScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("accessibility_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("accessibility_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("accessibility_subtitle")}
      </p>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("accessibility_section1_title")}
        </p>
        <ul className="space-y-1.5">
          {(
            [
              "a11y_high_contrast",
              "a11y_clear_nav",
              "a11y_responsive",
              "a11y_keyboard",
              "a11y_screen_reader",
              "a11y_reduced_motion",
              "a11y_readable_type",
              "a11y_color_contrast",
            ] as TranslationKey[]
          ).map((k) => (
            <li key={k} className="font-sans text-[12px] text-ink/80 flex items-start gap-1.5">
              <span className="text-clay shrink-0">·</span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("accessibility_section2_title")}
        </p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("accessibility_motion_text")}</p>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
          {t("accessibility_section3_title")}
        </p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("accessibility_improvements_text")}</p>
      </div>

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("accessibility_closing_quote")}
        </p>
      </div>
    </div>
  );
}

/* RELEASE NOTES, same editorial shell, structured as small labeled
   groups rather than legal sections, but identical visual language. */
