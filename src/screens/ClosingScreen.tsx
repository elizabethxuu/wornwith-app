import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { collectedStamps, onStampsChanged, openStampsPage, STAMP_COUNT } from "../lib/stamps";

export function ClosingScreen({ onReturnToWardrobe }: { onReturnToWardrobe: () => void }) {
  const { t } = useLanguage();
  const [count, setCount] = useState(() => collectedStamps().length);
  useEffect(() => onStampsChanged(() => setCount(collectedStamps().length)), []);
  const complete = count === STAMP_COUNT;
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center px-8 pt-16 pb-12 fade-up">
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-clay">
        {t("story_continues_title")}
      </p>
      <p className="font-display italic text-[25px] text-ink text-center mt-7 leading-snug [text-wrap:balance]">
        {t("thank_you_wearing_care")}
      </p>
      <p className="font-sans text-[13px] text-ink/80 text-center mt-10 leading-[1.8] max-w-xs">
        {t("closing_craftsmanship_line")}
      </p>
      <p className="font-sans text-[13px] text-ink/80 text-center mt-6 leading-[1.8] max-w-xs">
        {t("closing_stewardship_line")}
      </p>
      <p className="font-display italic text-[14px] text-clay text-center mt-12">
        {t("closing_evolve_line")}
      </p>

      <button
        onClick={onReturnToWardrobe}
        className="mt-14 border border-line rounded-full px-7 py-3 font-sans text-[12px] text-ink"
      >
        {t("return_to_wardrobe")}
      </button>

      {/* The way to the hidden last page: once every stop is stamped, a
          quiet "Passport complete"; until then, just a faint stamp mark
          for the curious to find. */}
      {complete ? (
        <button
          onClick={(e) => { e.stopPropagation(); openStampsPage(); }}
          className="mt-14 font-display italic text-[15px] text-[#8E3D52] underline decoration-[#8E3D52]/30 underline-offset-4"
        >
          {t("stamps_end_complete")}
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); openStampsPage(); }}
          aria-label={t("stamps_end_mark")}
          title={t("stamps_end_mark")}
          className="stamp-hint mt-16 mb-2 w-12 h-12 rounded-full border-[1.5px] border-dashed border-clay flex items-center justify-center rotate-[-12deg]"
        >
          <span className="w-8 h-8 rounded-full border border-clay flex items-center justify-center font-display italic text-[13px] text-clay">W</span>
        </button>
      )}
    </div>
  );
}

/* ABOUT THIS PASSPORT, same editorial shell as Privacy/Terms/Accessibility,
   with Product-page-style spec rows for Data Sources, and Material/
   Lifespan-style rows for Data Confidence and Passport Sharing. */
