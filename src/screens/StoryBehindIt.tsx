import { lazy, Suspense, useState, useEffect } from "react";
import { Card, useMountReveal, VerificationInfoPanel, ShareSheet } from "../components/UI";
import { useChapterColor } from "../lib/chapterColor";
import { loadWardrobe, saveWardrobe, logWardrobeEvent } from "../lib/persistence";
import { GARMENT } from "../lib/garment";
import { useLanguage } from "../lib/i18n";

// The map library is large and only this screen needs it, so it loads on demand.
const JourneyMap = lazy(() => import("../components/JourneyMap"));
import { Sparkles, Share, Bookmark } from "lucide-react";
import { ATTESTATION } from "../lib/passportRecord";


/* 10: THE STORY BEHIND IT */
export function StoryBehindIt() {
  const { t } = useLanguage();
  const storyColor = useChapterColor();
  const [savedToWardrobe, setSavedToWardrobe] = useState(false);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const handleSaveToWardrobe = () => {
    const items = loadWardrobe();
    const alreadySaved = items.some((it) => it.name === GARMENT.name);
    if (!alreadySaved) {
      const newItem = { name: GARMENT.name, tag: "DPP", worn: GARMENT.timesWorn, note: "Saved from passport", brand: GARMENT.brand };
      const updated = [...items, newItem];
      saveWardrobe(updated);
      logWardrobeEvent(newItem);
    }
    setSavedToWardrobe(true);
  };

  const { stepStyle: storyReveal } = useMountReveal();
  const [sparklePlayed, setSparklePlayed] = useState(false);
  const [sparkleStart, setSparkleStart] = useState(false);

  // The sparkle needs its own delay synced to when the Story card actually
  // becomes visible, a CSS animation on a still-invisible element (parent
  // opacity: 0) runs to completion unseen, so without this it would
  // already be over by the time anyone could see it.
  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const timer = setTimeout(() => setSparkleStart(true), 1830);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full px-5 py-6 fade-up">
      <Suspense fallback={<div className="w-full mb-4" style={{ minHeight: 340 }} aria-hidden="true" />}>
        <JourneyMap />
      </Suspense>
      <div style={storyReveal("translateY(16px)", 1330, 500)}>
        <Card>
          <button
            onClick={(e) => { e.stopPropagation(); setShowVerificationInfo(true); }}
            className="w-full flex items-center justify-between mb-3"
          >
            <span className="flex items-center gap-1 text-[11px] font-sans text-clay font-medium">
              {t(ATTESTATION.attestationUid ? "verified_passport" : "passport_record_pending")}
            </span>
            <span className="text-[10px] font-sans text-clay">{ATTESTATION.attestationUid ? t("record_on_base") : t("record_not_published_short")}</span>
          </button>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles
              size={13}
              style={{ color: storyColor }}
              className={sparkleStart && !sparklePlayed ? "icon-sparkle-once" : ""}
              onAnimationEnd={() => setSparklePlayed(true)}
            />
            <p
              className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide"
              style={{ ...storyReveal("translateY(6px)", 2110, 300) }}
            >
              {t("story_behind_it")}
            </p>
          </div>
          <p className="font-display italic text-[15px] text-ink leading-relaxed" style={storyReveal("translateY(6px)", 2410, 300)}>
            {t("story_sentence_1")}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-relaxed" style={storyReveal("translateY(6px)", 2530, 300)}>
            {t("story_sentence_2")}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-relaxed" style={storyReveal("translateY(6px)", 2650, 300)}>
            {t("story_sentence_3")}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-relaxed mt-3" style={storyReveal("translateY(6px)", 2770, 300)}>
            {t("story_p2")}
          </p>
          <p className="font-display italic text-[13px] text-ink mt-3" style={storyReveal("translateY(6px)", 2890, 300)}>
            {t("crafted_to_last")}
          </p>
        </Card>
      </div>

      <div className="flex gap-2.5 mt-4">
        <button
          onClick={() => setShareSheetOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 border border-line rounded-full py-2.5 font-sans text-[12px] text-ink transition-colors duration-300 hover:bg-black/[0.02]"
          style={storyReveal("translateY(8px)", 3190, 200)}
        >
          <Share size={14} strokeWidth={1.5} />
          {t("share_passport")}
        </button>
        <button
          onClick={handleSaveToWardrobe}
          disabled={savedToWardrobe}
          className="flex-1 flex items-center justify-center gap-2 bg-ink text-cream rounded-full py-2.5 font-sans text-[12px] transition-opacity duration-300 disabled:opacity-60"
          style={storyReveal("translateY(8px)", 3290, 200)}
        >
          <Bookmark size={14} strokeWidth={1.5} />
          {savedToWardrobe ? t("saved") : t("save_to_wardrobe")}
        </button>
      </div>
      <VerificationInfoPanel open={showVerificationInfo} onClose={() => setShowVerificationInfo(false)} />
      <ShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />
    </div>
  );
}
