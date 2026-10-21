import type { ReactNode, CSSProperties } from "react";
import { useLanguage, type TranslationKey } from "../lib/i18n";

// Editorial header for each inner chapter: a full-width crop of the campaign
// photograph (a different detail per chapter), the chapter number and name,
// a slim progress line, and a rounded content sheet that overlaps the photo.
// Screen numbers follow the live app: 2 Journey ... 10 End.
type Crop = { key: TranslationKey; origin: string; zoom: number };
const CHAPTERS: Record<number, Crop> = {
  2: { key: "contents_journey", origin: "0% 22%", zoom: 2.2 },
  3: { key: "chapter_materials", origin: "50% 66%", zoom: 2.4 },
  4: { key: "contents_care", origin: "100% 72%", zoom: 2.4 },
  5: { key: "chapter_environment", origin: "100% 0%", zoom: 2.2 },
  6: { key: "section_next_chapter", origin: "50% 30%", zoom: 2.6 },
  7: { key: "contents_story", origin: "0% 88%", zoom: 2.2 },
  8: { key: "contents_ownership", origin: "0% 42%", zoom: 2.2 },
  9: { key: "section_wardrobe", origin: "50% 44%", zoom: 1.15 },
  10: { key: "section_end", origin: "50% 100%", zoom: 1.5 },
};

export const hasChapterHero = (index: number) => index in CHAPTERS;

export default function ChapterShell({ index, total = 10, children }: { index: number; total?: number; children: ReactNode }) {
  const { t } = useLanguage();
  const c = CHAPTERS[index];
  if (!c) return <>{children}</>;
  const n = String(index).padStart(2, "0");
  return (
    <div data-testid="chapter-shell">
      <div className="relative h-[clamp(210px,34dvh,320px)] overflow-hidden bg-[#2B2622]">
        <img
          src="/images/overview-hero.jpg"
          alt=""
          aria-hidden="true"
          className="chapter-photo absolute inset-0 w-full h-full object-cover"
          style={{ transformOrigin: c.origin, "--z": c.zoom, objectPosition: c.origin } as CSSProperties}
        />
        {/* darkens the top for the floating buttons and the bottom for the title */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,16,12,0.38) 0%, rgba(20,16,12,0) 34%, rgba(20,16,12,0.1) 55%, rgba(20,16,12,0.62) 100%)" }} />
        {/* progress: one slim segment per screen */}
        <div className="absolute inset-x-0 top-[max(env(safe-area-inset-top),0.75rem)] flex justify-center pt-[1.35rem] px-16" aria-hidden="true">
          <div className="flex gap-1 w-full max-w-[220px]">
            {Array.from({ length: total - 1 }).map((_, i) => (
              <div key={i} className="flex-1 h-px" style={{ backgroundColor: i + 1 <= index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }} />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-9 text-white">
          <p className="chapter-rise font-sans text-[10px] uppercase tracking-[0.34em] text-white/80" style={{ "--s": "0.05s" } as CSSProperties}>
            {n}
          </p>
          <h1 className="chapter-rise font-display italic font-light text-[clamp(2.4rem,11vw,3.4rem)] leading-[0.95] mt-1" style={{ "--s": "0.15s", textShadow: "0 2px 24px rgba(0,0,0,0.35)" } as CSSProperties}>
            {t(c.key)}
          </h1>
        </div>
      </div>
      <div className="relative -mt-6 rounded-t-[28px] bg-paper pt-1 shadow-[0_-18px_40px_-24px_rgba(43,38,34,0.35)]">{children}</div>
    </div>
  );
}
