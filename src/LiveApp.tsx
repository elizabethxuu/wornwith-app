import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export default function LiveApp() {
  const [booted, setBooted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1400);
    return () => clearTimeout(t);
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

  if (!booted) {
    return (
      <div className="h-[100dvh] w-full bg-paper">
        <SkeletonLoader />
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
            className="w-10 h-10 rounded-full bg-white border border-line shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-blush-deep" />
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
            className="w-10 h-10 rounded-full bg-white border border-line shadow-sm flex items-center justify-center"
          >
            <ChevronRight size={20} className="text-blush-deep" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </div>
  );
}
