import { createContext, useContext, type ReactNode } from "react";

// One accent color per "chapter" of the passport, indexed to match
// liveScreens / the deck's screen order exactly. Inactive progress bar
// segments always use the warm stone tone regardless of chapter.
export const INACTIVE_PROGRESS_COLOR = "#E8E2DD";

// Story (index 7) has no assigned chapter color in the brief — left on the
// app's original blush accent so the emotional/editorial screen stays
// timeless rather than being tinted like the more data-driven chapters.
export const CHAPTER_COLORS: string[] = [
  "#3B342F", // 0 Welcome — Digital Product Passport — Charcoal
  "#B98A4A", // 1 Product Overview — Materials — Warm Bronze
  "#7B5A45", // 2 Product Lifecycle — Craftsmanship — Deep Cocoa
  "#7B5A45", // 3 Supply Chain — Craftsmanship — Deep Cocoa
  "#6E7E5C", // 4 Care Guide — Olive
  "#8A9F7A", // 5 Sustainability Metrics — Impact / Environmental Performance — Sage
  "#5E7B5E", // 6 What's Next — Repair / Circularity — Forest Green
  "#415666", // 7 Story — Deep Ocean (coastal palette)
  "#A66A73", // 8 Personalization — Ownership — Dusty Burgundy
  "#556B8A", // 9 My Wardrobe — Today's Edit — Midnight Blue
];

// Used specifically for the "From the Archives" sub-section inside the
// Ownership screen, since the brief names it as its own chapter distinct
// from Ownership even though both currently live on one screen.
export const ARCHIVE_ACCENT_COLOR = "#6D556A"; // Deep Plum

const DEFAULT_ACCENT = "#C97A8C";

const ChapterColorContext = createContext<string>(DEFAULT_ACCENT);

export function ChapterColorProvider({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <ChapterColorContext.Provider value={color}>{children}</ChapterColorContext.Provider>
  );
}

export function useChapterColor(): string {
  return useContext(ChapterColorContext);
}
