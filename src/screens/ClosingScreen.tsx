import { useLanguage } from "../lib/i18n";

export function ClosingScreen({ onReturnToWardrobe }: { onReturnToWardrobe: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-8 fade-up">
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-clay">
        {t("story_continues_title")}
      </p>
      <p className="font-display italic text-2xl text-ink text-center mt-4 leading-snug">
        {t("thank_you_wearing_care")}
      </p>
      <p className="font-sans text-[13px] text-ink/80 text-center mt-6 leading-relaxed max-w-xs">
        {t("closing_craftsmanship_line")}
      </p>
      <p className="font-sans text-[13px] text-ink/80 text-center mt-4 leading-relaxed max-w-xs">
        {t("closing_stewardship_line")}
      </p>
      <p className="font-display italic text-[13px] text-clay text-center mt-8">
        {t("closing_evolve_line")}
      </p>

      <button
        onClick={onReturnToWardrobe}
        className="mt-12 border border-line rounded-full px-6 py-2.5 font-sans text-[12px] text-ink"
      >
        {t("return_to_wardrobe")}
      </button>
    </div>
  );
}

/* ABOUT THIS PASSPORT, same editorial shell as Privacy/Terms/Accessibility,
   with Product-page-style spec rows for Data Sources, and Material/
   Lifespan-style rows for Data Confidence and Passport Sharing. */
