import { useEffect, useState } from "react";
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

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width * 0.3) {
      setIndex((i) => Math.max(0, i - 1));
    } else {
      setIndex((i) => Math.min(liveScreens.length - 1, i + 1));
    }
  };

  if (!booted) {
    return (
      <div className="h-[100dvh] w-full bg-paper">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-paper flex flex-col overflow-hidden">
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

      <div className="flex-1 overflow-y-auto no-scrollbar" onClick={handleTap}>
        {liveScreens[index]}
      </div>

      <div
        className="flex justify-center pb-2 shrink-0"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        <p className="text-[9px] font-sans text-clay/50 tracking-wide">
          tap right to continue · tap left to go back
        </p>
      </div>
    </div>
  );
}
