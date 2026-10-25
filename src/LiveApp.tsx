import { useEffect, useRef, useState } from "react";
import { requestMapStop } from "./lib/mapFocus";
import { LazyStampPages } from "./components/LazyStampPages";
import { ChevronLeft, ChevronRight, WifiOff, SearchX, ChevronDown, ChevronUp } from "lucide-react";
import { readFlag, saveFlag, FOOTER_HIDDEN_KEY, LEGAL_LINKS, type LegalPage } from "./lib/uiPrefs";
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
  ContactScreen,
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
    <ProductOverview key="overview" intro={intro} onExploreJourney={() => goToScreen(2)} />,
    <ProductLifecycle key="lifecycle" onViewChapter={() => goToScreen(7)} onOpenMapStop={(i) => { requestMapStop(i); goToScreen(7); }} />,
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
const LAST_SCREEN = 10;

// Where the visitor is, kept for this tab only, so a reload (or iOS bringing
// the page back) returns to the same screen instead of the beginning.
const SCREEN_KEY = "wornwith:screen";
type Place = { screen: number; legal: "none" | LegalPage };
function savedPlace(): Place | null {
  // Only a reload (or Back/Forward into the page) returns to the saved
  // screen; opening the link or tapping the tag again starts at the top.
  try {
    const nav = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.type !== "reload" && nav.type !== "back_forward") return null;
  } catch {
    // ignore
  }
  try {
    const p = JSON.parse(sessionStorage.getItem(SCREEN_KEY) || "null");
    if (p && Number.isInteger(p.screen) && p.screen >= FIRST_SCREEN && p.screen <= LAST_SCREEN) {
      return { screen: p.screen, legal: typeof p.legal === "string" ? p.legal : "none" };
    }
  } catch {
    // ignore
  }
  return null;
}
function placeFromHistory(state: unknown): Place | null {
  const p = state as Partial<Place> | null;
  return p && Number.isInteger(p.screen) ? { screen: p.screen as number, legal: (p.legal as Place["legal"]) || "none" } : null;
}

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
  const [index, setIndex] = useState(() => placeFromHistory(window.history.state)?.screen ?? savedPlace()?.screen ?? FIRST_SCREEN);
  const scrollRef = useRef<HTMLElement>(null);
  // Built inside the component (not as a module-level constant) so
  // screens like ProductOverview can be given a real "jump to a specific
  // screen" callback, not just the generic forward-tap gesture.
  // The entrance only plays once per visit, and not for reduced motion.
  const [revealing, setRevealing] = useState(() => !introPlayed() && !prefersReducedMotion());
  const liveScreens = buildLiveScreens((i) => setIndex(i), revealing);
  const [legalPage, setLegalPage] = useState<"none" | LegalPage>(
    () => placeFromHistory(window.history.state)?.legal ?? savedPlace()?.legal ?? "none",
  );
  // Each screen is a step in the browser's history, so Back and Forward move
  // between screens (and out of a legal page) instead of leaving the site.
  const fromHistory = useRef(false);
  const firstPlace = useRef(true);
  useEffect(() => {
    const place: Place = { screen: index, legal: legalPage };
    try { sessionStorage.setItem(SCREEN_KEY, JSON.stringify(place)); } catch { /* ignore */ }
    const current = placeFromHistory(window.history.state);
    const state = { ...(window.history.state || {}), ...place };
    try {
      if (firstPlace.current || fromHistory.current) window.history.replaceState(state, "");
      else if (!current || current.screen !== index || current.legal !== legalPage) window.history.pushState(state, "");
    } catch { /* ignore */ }
    firstPlace.current = false;
    fromHistory.current = false;
  }, [index, legalPage]);
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const place = placeFromHistory(e.state);
      if (!place) return;
      fromHistory.current = true;
      setIndex(place.screen);
      setLegalPage(place.legal);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  // The legal footer starts folded away; an arrow opens it, and the same
  // links stay in the menu.
  const [footerHidden, setFooterHidden] = useState(() => readFlag(FOOTER_HIDDEN_KEY, true));
  const setFooter = (hidden: boolean) => { saveFlag(FOOTER_HIDDEN_KEY, hidden); setFooterHidden(hidden); };

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
    }, 900);
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

  // Left and right arrow keys turn the page, unless someone is typing or a
  // sheet or menu is open over the passport.
  const keyNav = useRef({ goPrev, goNext });
  keyNav.current = { goPrev, goNext };
  useEffect(() => {
    if (bootState !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true'], [role='slider']")) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      if (e.key === "ArrowLeft") keyNav.current.goPrev();
      else keyNav.current.goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bootState]);

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
      <main className="h-[100dvh] w-full bg-paper">
        <EmptyState
          headingLevel={1}
          icon={WifiOff}
          eyebrow={t("connection_eyebrow")}
          title={t("connection_error_title")}
          subtitle={t("connection_error_subtitle")}
          actionLabel={t("try_again")}
          onAction={runVerification}
        />
      </main>
    );
  }

  if (bootState === "not-found") {
    return (
      <main className="h-[100dvh] w-full bg-paper">
        <EmptyState
          headingLevel={1}
          icon={SearchX}
          eyebrow={t("dpp_eyebrow")}
          title={t("not_found_title")}
          subtitle={t("not_found_subtitle")}
          actionLabel={t("not_found_action")}
          actionHref={window.location.pathname}
        />
      </main>
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
      {/* The hidden last page of the passport (stamps). */}
      {/* The hidden stamp pages, and the next owner's welcome when a
          "pass it on" link is opened. Loaded only when needed. */}
      <LazyStampPages onGoTo={(i) => { setLegalPage("none"); setIndex(i); }} ready={!revealing} />

      {/* The brand header stays on every screen: menu, logo, share. */}
      <PassportTopBar showTools compact={!isFront} onGoTo={(i) => { setLegalPage("none"); setIndex(i); }} onOpenLegal={setLegalPage} />

      <main ref={scrollRef} className="flex-1 overflow-y-auto visible-scrollbar relative" onClick={handleTap}>
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
          ) : legalPage === "contact" ? (
            <ContactScreen onBack={() => setLegalPage("none")} />
          ) : (
            <ChapterShell index={index} total={liveScreens.length}>{liveScreens[index]}</ChapterShell>
          )}
        </ChapterColorProvider>
      </main>


      {/* Minimal legal footer, rendered once here rather than per-screen.
          It can be closed so it never covers a screen; the same links stay
          in the menu, so nothing becomes unreachable. */}
      {!footerHidden && (
      <footer
        className="relative flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 pl-4 pr-10 pt-2 shrink-0 print:hidden"
        style={isFront ? { paddingBottom: "max(env(safe-area-inset-bottom), 12px)" } : undefined}
      >
        <p className="font-sans text-[10px] text-clay">{t("footer_copyright")}</p>
        {LEGAL_LINKS.map(([key, page]) => (
          <button
            key={page}
            onClick={() => setLegalPage(page)}
            className="font-sans text-[10px] text-clay hover:underline underline-offset-2 min-h-[24px] px-1"
          >
            {t(key)}
          </button>
        ))}
        <button
          onClick={() => setFooter(true)}
          aria-label={t("footer_hide")}
          title={t("footer_hide")}
          className="absolute right-2 top-1.5 w-7 h-7 flex items-center justify-center text-clay rounded-full hover:bg-line/50"
        >
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </footer>
      )}

      {/* Footer folded away: a small arrow brings it back. On the overview it
          is a slim strip under the photo; elsewhere it sits in the nav bar. */}
      {footerHidden && isFront && (
        <footer
          className="shrink-0 flex justify-center print:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <button
            onClick={() => setFooter(false)}
            aria-label={t("footer_show")}
            title={t("footer_show")}
            className="w-12 h-6 flex items-center justify-center text-clay hover:text-ink"
          >
            <ChevronUp size={16} strokeWidth={1.5} />
          </button>
        </footer>
      )}

      {/* Visible, unambiguous nav bar, the tap-zones in the content area
          still work too, but this makes it obvious at a glance that you can
          move forward/back. Fixed outside the scrollable content so it can
          never overlap whatever text happens to be on a given screen. */}
      {!isFront && (
      <nav aria-label={t("nav_chapters")}
        className="flex items-center justify-between px-4 shrink-0 border-t border-line print:hidden"
        style={{ paddingTop: "10px", paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        {!isFirst ? (
          <button
            onClick={goPrev}
            aria-label={t("nav_previous")}
            className="w-10 h-10 rounded-full bg-ink shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-paper" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
        <div className="flex items-center gap-1">
          <p className="font-sans text-[9px] text-clay">
            {index - FIRST_SCREEN + 1} / {liveScreens.length - FIRST_SCREEN}
          </p>
          {footerHidden && (
            <button
              onClick={() => setFooter(false)}
              aria-label={t("footer_show")}
              title={t("footer_show")}
              className="w-7 h-7 flex items-center justify-center text-clay rounded-full hover:bg-line/50"
            >
              <ChevronUp size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
        {!isLast ? (
          <button
            onClick={goNext}
            aria-label={t("nav_next")}
            className="w-10 h-10 rounded-full bg-ink shadow-sm flex items-center justify-center"
          >
            <ChevronRight size={20} className="text-paper" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </nav>
      )}
    </div>
  );
}
