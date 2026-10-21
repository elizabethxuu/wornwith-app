import { useEffect } from "react";

// Plays once per visit, right after the W screen: a plain paper screen lifts
// away upward to reveal the photo. Skipped for people who prefer reduced
// motion.
let played = false;
export const introPlayed = () => played;
export const REVEAL_MS = 1600;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function OpeningReveal({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      played = true;
      onDone();
    }, REVEAL_MS + 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-testid="opening-reveal"
      aria-hidden="true"
      className="lux-curtain absolute inset-0 z-50 bg-paper"
    />
  );
}
