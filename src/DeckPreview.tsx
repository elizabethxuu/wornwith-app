import { useState } from "react";
import PhoneShell from "./components/PhoneShell";
import { ChapterColorProvider, CHAPTER_COLORS } from "./lib/chapterColor";
import {
  SkeletonLoader,
  CameraScan,
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

const screens = [
  { name: "Verifying", el: <SkeletonLoader /> },
  { name: "Scan", el: <CameraScan /> },
  { name: "Welcome", el: <Welcome /> },
  { name: "Overview", el: <ProductOverview /> },
  { name: "Lifecycle", el: <ProductLifecycle /> },
  { name: "Supply Chain", el: <SupplyChain /> },
  { name: "Care", el: <CareGuide /> },
  { name: "Sustainability", el: <SustainabilityMetrics /> },
  { name: "What's Next", el: <WhatsNext /> },
  { name: "Story", el: <StoryBehindIt /> },
  { name: "Personalize", el: <Personalization /> },
  { name: "Wardrobe", el: <MyWardrobe /> },
];

// The first two screens (verifying / scan simulation) come before the
// passport itself starts, so they don't have a chapter color — everything
// from Welcome onward maps into CHAPTER_COLORS.
const DEFAULT_ACCENT = "#C97A8C";
function chapterColorFor(index: number): string {
  return index >= 2 ? CHAPTER_COLORS[index - 2] : DEFAULT_ACCENT;
}

export default function DeckPreview() {
  const [index, setIndex] = useState(0);
  const color = chapterColorFor(index);

  const next = () => setIndex((i) => Math.min(i + 1, screens.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 py-10 px-4 bg-[#F0ECE6]">
      <div className="text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-blush-deep font-sans font-semibold">
          wornwith.care
        </p>
        <h1 className="font-display italic text-2xl text-ink mt-1 transition-colors duration-500" style={{ color }}>
          {index + 1}. {screens[index].name}
        </h1>
      </div>

      <PhoneShell key={index}>
        <ChapterColorProvider color={color}>{screens[index].el}</ChapterColorProvider>
      </PhoneShell>

      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="font-sans text-xs tracking-wide text-clay disabled:opacity-30 px-3 py-2"
        >
          ← Back
        </button>
        <div className="flex gap-1.5">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === index ? "16px" : "6px",
                height: "6px",
                backgroundColor: i === index ? chapterColorFor(i) : "#E8E2DD",
              }}
              aria-label={`Go to screen ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={index === screens.length - 1}
          className="font-sans text-xs tracking-wide disabled:opacity-30 px-3 py-2 transition-colors duration-500"
          style={{ color }}
        >
          Next →
        </button>
      </div>

      <div className="flex gap-4 pt-2">
        <a href="?mode=tag" className="font-sans text-[11px] text-clay underline underline-offset-2">
          Printable QR tag
        </a>
        <a href="?mode=live" className="font-sans text-[11px] text-clay underline underline-offset-2">
          Preview live mobile view
        </a>
      </div>
    </div>
  );
}
