import { useEffect } from "react";

// Plays once per visit: the W logo appears on a quiet paper screen, a thin
// rule draws under it, and then the whole screen lifts away like a curtain to
// reveal the photo. Skipped for people who prefer reduced motion.
let played = false;
export const introPlayed = () => played;
export const REVEAL_MS = 2800;

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
      className="lux-curtain absolute inset-0 z-50 bg-paper flex flex-col items-center justify-center"
    >
      <img src="/images/wornwith-logo.png" alt="" className="lux-curtain-logo w-[clamp(7rem,30vw,11rem)] h-auto" />
      <div className="lux-curtain-rule mt-6 h-px w-20 bg-ink/70" />
      <p className="lux-curtain-word mt-5 font-sans text-[10px] uppercase tracking-[0.42em] text-clay">wornwith.care</p>
    </div>
  );
}
