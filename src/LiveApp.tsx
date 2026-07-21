import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, WifiOff, SearchX } from "lucide-react";
import { EmptyState } from "./components/UI";
import { GARMENT } from "./lib/garment";
import { useLanguage } from "./lib/i18n";
import { ChapterColorProvider, CHAPTER_COLORS, INACTIVE_PROGRESS_COLOR } from "./lib/chapterColor";
import {
  SkeletonLoader,
  Welcome,
  ProductOverview,
  ProductLifecycle,
  SupplyChain,
  CareGuide,
  SustainabilityMetrics,
  WhatsNext,
  StoryBehindIt,
  Personalization,
  MyWardrobe,
} from "./screens/Screens";

// Real users arrive here because they already scanned the physical tag with
// the iPhone Camera app. No fake scan-simulation screen — go straight from
// "verifying" into the passport.
const liveScreens = [
  <Welcome key="welcome" />,
  <ProductOverview key="overview" />,
  <ProductLifecycle key="lifecycle" />,
  <SupplyChain key="supply" />,
  <CareGuide key="care" />,
  <SustainabilityMetrics key="sustainability" />,
  <WhatsNext key="next" />,
  <StoryBehindIt key="story" />,
  <Personalization key="personalize" />,
  <MyWardrobe key="wardrobe" />,
];

// One label per screen above, used as the subtle section indicator next to
// the progress bar. Kept as translation keys so it follows the language
// toggle like everything else.
const sectionKeys = [
  "section_passport",
  "section_product",
  "section_journey",
  "section_journey",
  "section_care",
  "section_impact",
  "section_next_chapter",
  "section_story",
  "section_ownership",
  "section_wardrobe",
] as const;

type BootState = "verifying" | "ready" | "offline" | "not-found";

function checkDppId(): boolean {
  // If the URL carries a dpp param (the way a real scanned tag would), it
  // must match this garment's actual ID. No param at all (e.g. someone just
  // typed the bare domain) is treated as valid, since that's the normal
  // "scanned the physical tag" case for this single-garment demo.
  const params = new URLSearchParams(window.location.search);
  const dpp = params.get("dpp");
  if (!dpp) return true;
  return dpp === GARMENT.dppId;
}

export default function LiveApp() {
  const { t } = useLanguage();
  const [bootState, setBootState] = useState<BootState>("verifying");
  const [index, setIndex] = useState(0);
  const [showClosing, setShowClosing] = useState(false);

  const runVerification = () => {
    setBootState("verifying");
    setTimeout(() => {
      if (!navigator.onLine) {
        setBootState("offline");
        return;
      }
      if (!checkDppId()) {
        setBootState("not-found");
        return;
      }
      setBootState("ready");
    }, 1400);
  };

  useEffect(() => {
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (index === liveScreens.length - 1) {
      setShowClosing(true);
      return;
    }
    setIndex((i) => Math.min(liveScreens.length - 1, i + 1));
  };

  const handleTap = (e: React.MouseEvent) => {
    // Don't hijack taps meant for actual controls — inputs, textareas,
    // buttons, links, and checkboxes should just work normally.
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, button, a, label, select")) {
      return;
    }
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.3) {
      goPrev();
    } else {
      goNext();
    }
  };

  if (bootState === "verifying") {
    return (
      <div className="h-[100dvh] w-full bg-paper">
        <SkeletonLoader />
      </div>
    );
  }

  if (bootState === "offline") {
    return (
      <div className="h-[100dvh] w-full bg-paper">
        <EmptyState
          icon={WifiOff}
          eyebrow={t("connection_eyebrow")}
          title={t("connection_error_title")}
          subtitle={t("connection_error_subtitle")}
          actionLabel={t("try_again")}
          onAction={runVerification}
        />
      </div>
    );
  }

  if (bootState === "not-found") {
    return (
      <div className="h-[100dvh] w-full bg-paper">
        <EmptyState
          icon={SearchX}
          eyebrow={t("dpp_eyebrow")}
          title={t("not_found_title")}
          subtitle={t("not_found_subtitle")}
          actionLabel={t("scan_again")}
          actionHref="?mode=tag"
        />
      </div>
    );
  }

  const isFirst = index === 0;
  const isLast = index === liveScreens.length - 1;

  if (showClosing) {
    return (
      <div className="h-[100dvh] w-full bg-paper flex flex-col items-center justify-center px-8 fade-up" style={{ animationDuration: "800ms" }}>
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
          onClick={() => setShowClosing(false)}
          className="mt-12 border border-line rounded-full px-6 py-2.5 font-sans text-[12px] text-ink"
        >
          {t("return_to_wardrobe")}
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-paper flex flex-col overflow-hidden relative">
      {/* subtle current-section label — now tinted per chapter */}
      <p
        className="font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-center shrink-0 transition-colors duration-500"
        style={{ paddingTop: "max(env(safe-area-inset-top), 10px)", color: CHAPTER_COLORS[index] }}
      >
        {t(sectionKeys[index])}
      </p>

      {/* story-style progress bar — each segment carries its own chapter's
          color, so the bar reads as a single quiet marker of where you are,
          not a multi-colored progress fill */}
      <div
        className="flex gap-1 px-3 shrink-0 mt-1.5"
      >
        {liveScreens.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: INACTIVE_PROGRESS_COLOR }}
          >
            <div
              className="h-full transition-all duration-500 ease-in-out"
              style={{
                width: i === index ? "100%" : "0%",
                backgroundColor: CHAPTER_COLORS[i],
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto visible-scrollbar relative" onClick={handleTap}>
        <ChapterColorProvider color={CHAPTER_COLORS[index]}>
          {liveScreens[index]}
        </ChapterColorProvider>
      </div>

      {/* Visible, unambiguous nav bar — the tap-zones in the content area
          still work too, but this makes it obvious at a glance that you can
          move forward/back. Fixed outside the scrollable content so it can
          never overlap whatever text happens to be on a given screen. */}
      <div
        className="flex items-center justify-between px-4 shrink-0 border-t border-line"
        style={{ paddingTop: "10px", paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        {!isFirst ? (
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="w-10 h-10 rounded-full bg-ink shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
        <p className="font-sans text-[9px] text-clay/70">
          {index + 1} / {liveScreens.length}
        </p>
        {!isLast ? (
          <button
            onClick={goNext}
            aria-label="Next"
            className="w-10 h-10 rounded-full bg-ink shadow-sm flex items-center justify-center"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}
