import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, WifiOff, SearchX } from "lucide-react";
import { EmptyState } from "./components/UI";
import { GARMENT } from "./lib/garment";
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
  const [bootState, setBootState] = useState<BootState>("verifying");
  const [index, setIndex] = useState(0);

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
  const goNext = () => setIndex((i) => Math.min(liveScreens.length - 1, i + 1));

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
          eyebrow="Connection"
          title="Couldn't verify this passport"
          subtitle="Check your connection and try again. The garment's story hasn't gone anywhere."
          actionLabel="Try again"
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
          eyebrow="Digital Product Passport"
          title="No passport found"
          subtitle="This code doesn't match a garment we know. Rescan the tag, or check the link."
          actionLabel="Scan again"
          actionHref="?mode=tag"
        />
      </div>
    );
  }

  const isFirst = index === 0;
  const isLast = index === liveScreens.length - 1;

  return (
    <div className="h-[100dvh] w-full bg-paper flex flex-col overflow-hidden relative">
      {/* story-style progress bar */}
      <div
        className="flex gap-1 px-3 shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        {liveScreens.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full bg-line overflow-hidden">
            <div
              className="h-full bg-blush-deep transition-all duration-300"
              style={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto visible-scrollbar relative" onClick={handleTap}>
        {liveScreens[index]}
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
        <p className="font-sans text-[9px] text-clay/50">
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
