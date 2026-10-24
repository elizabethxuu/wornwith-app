import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import * as ambient from "../lib/ambient";
import { Eyebrow, VerificationInfoPanel, ShareSheet, ProductHero } from "../components/UI";
import { ChapterColorProvider } from "../lib/chapterColor";
import { loadOwnershipRecord } from "../lib/persistence";
import { GARMENT } from "../lib/garment";
import { useLanguage } from "../lib/i18n";
import { Volume2, VolumeX, Pause, Play, ChevronRight, Check } from "lucide-react";
import { ATTESTATION } from "../lib/passportRecord";



/* 4: PRODUCT OVERVIEW */
export function ProductOverview({
  onExploreJourney,
  intro = false,
}: { onExploreJourney?: () => void; intro?: boolean } = {}) {
  const { t } = useLanguage();
  const [ctaFading, setCtaFading] = useState(false);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const sound = useSyncExternalStore(ambient.subscribe, ambient.getState);
  // The ambient sound belongs to this page: it fades out when you leave.
  useEffect(() => () => ambient.stop(), []);
  const detailsRef = useRef<HTMLDivElement>(null);
  const dppNo = GARMENT.fullDppId.replace("#", "");

  const goExplore = () => {
    if (ctaFading) return;
    setCtaFading(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The photo drifts closer while the page dissolves to paper, then the
    // Journey fades in.
    setTimeout(() => onExploreJourney?.(), reduced ? 120 : 700);
  };
  const showDetails = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    detailsRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  // A one-time, bespoke-timed entrance for the Crafted to Last panel,
  // each element has its own specific delay/duration/easing per spec, so
  // this is a small local helper rather than the shared useMountReveal
  // hook (which uses one fixed curve for everything).
  const [craftedMounted, setCraftedMounted] = useState(false);
  const [craftedReducedMotion, setCraftedReducedMotion] = useState(false);
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCraftedReducedMotion(reduced);
    if (reduced) {
      setCraftedMounted(true);
      return;
    }
    const timer = setTimeout(() => setCraftedMounted(true), 20);
    return () => clearTimeout(timer);
  }, []);

  const craftedReveal = (
    translateFrom: string,
    delayMs: number,
    durationMs: number,
    easing = "0.16,1,0.3,1"
  ): React.CSSProperties => {
    if (craftedReducedMotion) return { opacity: 1, transform: "none" };
    return {
      opacity: craftedMounted ? 1 : 0,
      transform: craftedMounted ? "translate(0,0)" : translateFrom,
      transition: `opacity ${durationMs}ms cubic-bezier(${easing}) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(${easing}) ${delayMs}ms`,
    };
  };

  // The one-time traveling blush wash only plays if motion isn't reduced,
  // and only once, it's driven by the same craftedMounted flag rather
  // than looping.
  const craftedWashActive = craftedMounted && !craftedReducedMotion;

  const rows = [
    [t("material"), t("material_value")],
    [t("made_in"), t("made_in_value")],
    [t("certified"), GARMENT.certified],
    [t("espr_verification_label"), "check"],
    [t("lifespan"), t("lifespan_value")],
    [t("repairability"), "8.5 / 10"],
  ];
  return (
    <ChapterColorProvider color="#2B2622">
    <div className="h-full fade-up">
      {/* Full-bleed opening panel: image, quiet controls, one frosted
          panel with the way in. Everything else sits below it. */}
      <section
        className="relative h-full min-h-[460px] overflow-hidden bg-paper flex flex-col"
        style={{ "--lux-d": intro ? "0.6s" : "0.05s" } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 min-h-0 overflow-hidden bg-[#E9E0D5]">
          <div className="absolute inset-x-3 top-3 z-10 flex flex-col items-stretch gap-2">
          <p
            className="light-island lux-rise mx-auto max-w-md w-full px-5 py-[clamp(0.6rem,2dvh,1rem)] text-center font-display italic text-[clamp(0.95rem,2.4dvh,1.15rem)] leading-snug text-ink text-balance border border-white/60 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_30px_-12px_rgba(43,38,34,0.25)]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.28) 55%, rgba(255,255,255,0.46) 100%)", "--lux-s": "0.1s" } as React.CSSProperties}
          >
            {t("hero_caption")}
          </p>
          </div>
        <div aria-hidden="true" className="absolute inset-0 lux-kenburns">
          <img
            src="/images/overview-hero.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-[50%_28%] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            style={{ transform: ctaFading ? "scale(1.08)" : "scale(1)" }}
          />
        </div>

        {/* Sound on the left, next on the right: one row, same size and glass,
            so the two always line up and the photo stays clear. The row is
            positioned without a transform because lux-rise animates transform. */}
        <div
          className="lux-rise absolute inset-x-3 top-[calc(36%-1.125rem)] z-10 flex items-start justify-between pointer-events-none"
          style={{ "--lux-s": "0.35s" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => ambient.setMuted(!sound.muted)}
              aria-label={sound.muted ? t("sound_turn_on") : t("sound_turn_off")}
              aria-pressed={!sound.muted}
              className="light-island w-9 h-9 flex items-center justify-center bg-white/60 backdrop-blur-md border border-white/60 text-ink"
            >
              {sound.muted ? <VolumeX size={16} strokeWidth={1.25} /> : <Volume2 size={16} strokeWidth={1.25} />}
            </button>
            {!sound.muted && (
              <button
                onClick={() => ambient.setPaused(!sound.paused)}
                aria-label={sound.paused ? t("sound_play") : t("sound_pause")}
                className="light-island w-9 h-9 flex items-center justify-center bg-white/60 backdrop-blur-md border border-white/60 text-ink"
              >
                {sound.paused ? <Play size={14} strokeWidth={1.25} /> : <Pause size={14} strokeWidth={1.25} />}
              </button>
            )}
          </div>
          <button
            onClick={goExplore}
            aria-label={t("hero_next")}
            className="light-island pointer-events-auto w-9 h-9 flex items-center justify-center bg-white/60 backdrop-blur-md border border-white/60 text-ink"
          >
            <ChevronRight size={18} strokeWidth={1.25} />
          </button>
        </div>

        <div
          className="light-island lux-rise absolute inset-x-3 bottom-3 mx-auto max-w-md bg-white/85 backdrop-blur-md border border-white/70 px-4 pt-[clamp(0.6rem,2dvh,1rem)] pb-[clamp(0.4rem,1.2dvh,0.75rem)] text-center"
          style={{ "--lux-s": "0.55s" } as React.CSSProperties}
        >
          <p className="font-display italic text-[clamp(1.05rem,3dvh,1.5rem)] leading-tight text-ink text-balance">
            {t("product_name_l1")} {t("product_name_l2")}
          </p>
          <button
            onClick={() => setShowVerificationInfo(true)}
            className="mt-1.5 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-clay"
          >
            {t(ATTESTATION.attestationUid ? "dpp_verified" : "dpp_record_pending")} · <span className="whitespace-nowrap">{dppNo} ›</span>
          </button>
          <div className="mt-[clamp(0.35rem,1.2dvh,0.75rem)] border-t border-ink/10 flex flex-col">
            <button
              onClick={goExplore}
              className="py-[clamp(0.4rem,1.6dvh,0.75rem)] font-sans text-[12px] uppercase tracking-[0.2em] text-ink transition-opacity duration-200"
              style={{ opacity: ctaFading ? 0.6 : 1 }}
            >
              {t("hero_explore")} →
            </button>
            <button
              onClick={showDetails}
              className="py-2 min-h-[24px] font-sans text-[10px] uppercase tracking-[0.2em] text-clay"
            >
              {t("hero_details")} ↓
            </button>
          </div>
        </div>

          {/* Dissolve to paper while leaving for the Journey */}
          <div
            aria-hidden="true"
            data-testid="leave-veil"
            className="absolute inset-0 z-20 bg-paper pointer-events-none transition-opacity duration-[650ms] ease-in"
            style={{ opacity: ctaFading ? 1 : 0 }}
          />
        </div>

      </section>

      <div ref={detailsRef} className="relative bg-paper px-5 py-6 max-w-[520px] mx-auto">
      <Eyebrow>{t("section_product")}</Eyebrow>
      <div className="mt-2" />
      <ProductHero
        videoSrc="/videos/product-hero-2.mp4"
        fallbackImageSrc={GARMENT.image}
        altText={t("product_hero_alt")}
      />
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display italic text-2xl text-ink leading-tight">
          {t("product_name_l1")}
          <br />{t("product_name_l2")}
        </h2>
        {/* The ESPR signal, filling the space beside the name: a black
            pill that opens the signed record. */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowVerificationInfo(true); }}
          aria-label={t("espr_verification_label")}
          className="shrink-0 mt-1 flex flex-col items-center gap-1.5"
        >
          <span className="flex items-center gap-1.5 bg-ink text-cream rounded-full pl-2.5 pr-3.5 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-85">
            <Check size={12} strokeWidth={2.5} aria-hidden="true" />
            ESPR
          </span>
          <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-clay">{t("espr_badge_caption")}</span>
        </button>
      </div>
      <p className="font-sans text-[11px] text-clay mt-1 mb-4">
        {t("tagline_coat")}
      </p>

      {/* Static editorial heading, never animates, always visible */}
      <p
        className="font-sans text-[13px] uppercase font-medium mb-2"
        style={{ color: "#8E3D52", letterSpacing: "0.20em" }}
      >
        {t("product_editorial_label")}
      </p>
      <div style={{ borderTop: "1px solid rgba(142,61,82,0.18)" }} className="mb-4" />

      {/* A slow editorial reveal, the panel rises into place, a soft
          one-time blush wash drifts across it, then the headline, each
          sentence, and finally the CTA fade in in sequence. Same
          two-column layout as before; only the appearance is new. */}
      <div
        className="relative flex items-center gap-4 px-4 py-2.5 mb-4 overflow-hidden border border-[#F0DDE1]"
        style={{ backgroundColor: "rgb(var(--c-card2))", ...craftedReveal("translateY(18px)", 350, 600, ".22,.61,.36,1") }}
      >
        {craftedWashActive && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none crafted-wash"
            style={{ animationDelay: "350ms" }}
          />
        )}
        <div className="relative flex-[3] min-w-0">
          <p
            className="font-display italic text-[15px] leading-snug"
            style={{ color: "#8E3D52", ...craftedReveal("translateY(8px)", 950, 450) }}
          >
            {t("product_editorial_headline")}
          </p>
          <p className="mt-2 font-sans text-[13px] text-clay leading-[1.6]">
            <span className="inline-block" style={craftedReveal("translateY(6px)", 1400, 350)}>{t("product_editorial_copy_1")}</span>{" "}
            <span className="inline-block" style={craftedReveal("translateY(6px)", 1520, 350)}>{t("product_editorial_copy_2")}</span>{" "}
            <span className="inline-block" style={craftedReveal("translateY(6px)", 1640, 350)}>{t("product_editorial_copy_3")}</span>
          </p>
        </div>

        {/* Real navigation, jumps directly to the Journey / Product
            Lifecycle page (index 2), not just the next screen in
            sequence, preserving the editorial progression: how it was
            made, then care, then wardrobe, then story. Its timeline
            animation begins immediately since that page's entrance
            animations are already mount-triggered. */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (ctaFading) return;
            setCtaFading(true);
            setTimeout(() => onExploreJourney?.(), 180);
          }}
          className="relative flex-[1] group flex items-center justify-center gap-1 font-sans text-[10px] font-medium cursor-pointer transition-opacity duration-200"
          style={{
            color: "#8E3D52",
            opacity: ctaFading ? 0.7 : 1,
            ...craftedReveal("translateX(10px)", 1990, 300),
          }}
        >
          <span className="relative inline-block group-hover:text-[#6E2F41] transition-colors duration-[180ms]">
            {t("product_editorial_cta")}
            <span
              className="absolute left-0 -bottom-0.5 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
              style={{ backgroundColor: "#6E2F41" }}
            />
          </span>
          <span className="inline-block transition-transform duration-[180ms] group-hover:translate-x-[4px]">→</span>
        </button>
      </div>

      <div className="divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 font-sans text-[12px]">
            <span className="text-clay">{k}</span>
            {v === "check" ? (
              <span className="text-[#5E7B5E] font-medium flex items-center gap-1" role="img" aria-label={t("espr_verification_label")}>
                <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              </span>
            ) : (
              <span className="text-ink font-medium">{v}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Eyebrow>{t("your_garment")}</Eyebrow>
        <div className="mt-2 space-y-1.5 font-sans text-[12px]">
          <div className="flex justify-between"><span className="text-clay">{t("owned_since")}</span><span className="text-ink">{t("owned_since_date")}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("times_worn")}</span><span className="text-ink">{loadOwnershipRecord().wearCount || GARMENT.timesWorn}</span></div>
          <div className="flex justify-between"><span className="text-clay">{t("condition")}</span><span className="text-ink font-medium">{loadOwnershipRecord().condition || t("excellent")}</span></div>
        </div>
      </div>

      <p className="font-display italic text-[15px] text-ink/80 leading-snug mt-10">{t("dpp_explainer_short")}</p>
      <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-clay mt-3 mb-2">{t("welcome_by")}</p>
      <VerificationInfoPanel open={showVerificationInfo} onClose={() => setShowVerificationInfo(false)} />
      </div>
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
    </ChapterColorProvider>
  );
}
