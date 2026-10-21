import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, WifiOff, SearchX } from "lucide-react";
import { EmptyState } from "./components/UI";
import PassportTopBar from "./components/PassportTopBar";
import ChapterShell from "./components/ChapterShell";
import OpeningReveal, { introPlayed, prefersReducedMotion } from "./components/OpeningReveal";
import { GARMENT } from "./lib/garment";
import { useLanguage } from "./lib/i18n";
import { ChapterColorProvider, CHAPTER_COLORS } from "./lib/chapterColor";
import {
  SkeletonLoader,
  CameraScan,
  ProductOverview,
  ProductLifecycle,
  SupplyChain,
  CareGuide,
  SustainabilityMetrics,
  WhatsNext,
  StoryBehindIt,
  Personalization,
  MyWardrobe,
  PrivacyPolicyScreen,
  TermsOfUseScreen,
  AccessibilityScreen,
  ReleaseNotesScreen,
  ClosingScreen,
  AboutPassportScreen,
} from "./screens/Screens";

// Real users arrive here because they already scanned the physical tag with
// the iPhone Camera app. No fake scan-simulation screen, go straight from
// "verifying" into the passport.
function buildLiveScreens(goToScreen: (index: number) => void, intro: boolean) {
  return [
    // Slot 0 used to hold the "Enter the Archive" front screen. It is gone:
    // the app opens straight onto the overview. The slot stays empty so the
    // other screen numbers (and chapter colors) do not shift.
    null,
    <ProductOverview key="overview" intro={intro} onExploreJourney={() => goToScreen(2)} onGoTo={goToScreen} />,
    <ProductLifecycle key="lifecycle" onViewChapter={() => goToScreen(7)} />,
    <SupplyChain key="supply" />,
    <CareGuide key="care" />,
    <SustainabilityMetrics key="sustainability" />,
    <WhatsNext key="next" />,
    <StoryBehindIt key="story" />,
    <Personalization key="personalize" />,
    <MyWardrobe key="wardrobe" />,
    <ClosingScreen key="closing" onReturnToWardrobe={() => goToScreen(9)} />,
  ];
}

// The first screen people can reach (slot 0 is intentionally empty).
const FIRST_SCREEN = 1;

type BootState = "verifying" | "scanning" | "ready" | "offline" | "not-found";

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
  const [index, setIndex] = useState(FIRST_SCREEN);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Built inside the component (not as a module-level constant) so
  // screens like ProductOverview can be given a real "jump to a specific
  // screen" callback, not just the generic forward-tap gesture.
  // The entrance only plays once per visit, and not for reduced motion.
  const [revealing, setRevealing] = useState(() => !introPlayed() && !prefersReducedMotion());
  const liveScreens = buildLiveScreens((i) => setIndex(i), revealing);
  const [legalPage, setLegalPage] = useState<"none" | "privacy" | "terms" | "accessibility" | "release-notes" | "about-passport">("none");

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
      setBootState("scanning");
    }, 1400);
  };

  useEffect(() => {
    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every screen starts at the top, so coming back to the overview never
  // lands halfway down the page.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [index, legalPage]);

  const goPrev = () => {
    if (legalPage !== "none") {
      setLegalPage("none");
      return;
    }
    setIndex((i) => Math.max(FIRST_SCREEN, i - 1));
  };
  const goNext = () => {
    if (legalPage !== "none") {
      setLegalPage("none");
      return;
    }
    setIndex((i) => Math.min(liveScreens.length - 1, i + 1));
  };

  const handleTap = (e: React.MouseEvent) => {
    // Don't hijack taps meant for actual controls, inputs, textareas,
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
      // Reaching the ending is the one deliberate exception to "tap
      // anywhere advances", it should only happen via the explicit
      // right arrow, not an incidental tap on the last real page.
      if (index === liveScreens.length - 2) return;
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

  if (bootState === "scanning") {
    return (
      <div className="h-[100dvh] w-full">
        <CameraScan onComplete={() => setBootState("ready")} />
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

  const isFirst = index <= FIRST_SCREEN;
  const isLast = index === liveScreens.length - 1;
  // The opening screen and the product overview take over the whole page:
  // no progress bar, section label or arrow bar. Both carry their own
  // controls, and all the usual chrome returns from the Journey onward.
  const isFront = index <= FIRST_SCREEN && legalPage === "none";

  return (
    <div
      className={`app-shell h-[100dvh] w-full bg-paper flex flex-col overflow-hidden relative ${
        isFront ? "" : "md:max-w-[520px] md:mx-auto md:border-x md:border-line"
      }`}
    >
      {revealing && <OpeningReveal onDone={() => setRevealing(false)} />}

      {/* The brand header stays on every screen: menu, logo, share. */}
      <PassportTopBar onGoTo={(i) => { setLegalPage("none"); setIndex(i); }} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto visible-scrollbar relative" onClick={handleTap}>
        <ChapterColorProvider color={CHAPTER_COLORS[index]}>
          {legalPage === "privacy" ? (
            <PrivacyPolicyScreen onBack={() => setLegalPage("none")} />
          ) : legalPage === "terms" ? (
            <TermsOfUseScreen onBack={() => setLegalPage("none")} />
          ) : legalPage === "accessibility" ? (
            <AccessibilityScreen onBack={() => setLegalPage("none")} />
          ) : legalPage === "release-notes" ? (
            <ReleaseNotesScreen onBack={() => setLegalPage("none")} />
          ) : legalPage === "about-passport" ? (
            <AboutPassportScreen onBack={() => setLegalPage("none")} />
          ) : (
            <ChapterShell index={index} total={liveScreens.length}>{liveScreens[index]}</ChapterShell>
          )}
        </ChapterColorProvider>
      </div>


      {/* Minimal legal footer, shown above nav on every screen, rendered
          once here rather than duplicated per-screen. Real buttons, not
          external links, both open the dedicated in-app screens. */}
      <div
        className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 px-4 pt-2 shrink-0 print:hidden"
        style={isFront ? { paddingBottom: "max(env(safe-area-inset-bottom), 12px)" } : undefined}
      >
        <p className="font-sans text-[9px] text-clay/60">{t("footer_copyright")}</p>
        <button
          onClick={() => setLegalPage("privacy")}
          className="font-sans text-[9px] text-clay/60 hover:underline underline-offset-2"
        >
          {t("footer_privacy")}
        </button>
        <button
          onClick={() => setLegalPage("terms")}
          className="font-sans text-[9px] text-clay/60 hover:underline underline-offset-2"
        >
          {t("footer_terms")}
        </button>
        <button
          onClick={() => setLegalPage("accessibility")}
          className="font-sans text-[9px] text-clay/60 hover:underline underline-offset-2"
        >
          {t("footer_accessibility")}
        </button>
        <button
          onClick={() => setLegalPage("release-notes")}
          className="font-sans text-[9px] text-clay/60 hover:underline underline-offset-2"
        >
          {t("footer_release_notes")}
        </button>
        <button
          onClick={() => setLegalPage("about-passport")}
          className="font-sans text-[9px] text-clay/60 hover:underline underline-offset-2"
        >
          {t("footer_about_passport")}
        </button>
      </div>

      {/* Visible, unambiguous nav bar, the tap-zones in the content area
          still work too, but this makes it obvious at a glance that you can
          move forward/back. Fixed outside the scrollable content so it can
          never overlap whatever text happens to be on a given screen. */}
      {!isFront && (
      <div
        className="flex items-center justify-between px-4 shrink-0 border-t border-line print:hidden"
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
          {index - FIRST_SCREEN + 1} / {liveScreens.length - FIRST_SCREEN}
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
      )}
    </div>
  );
}
