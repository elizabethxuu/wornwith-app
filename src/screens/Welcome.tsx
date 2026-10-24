import { useState, useEffect } from "react";
import { VerificationInfoPanel } from "../components/UI";
import { GARMENT } from "../lib/garment";
import { useLanguage } from "../lib/i18n";


/* 3: WELCOME */
export function Welcome({ onEnter }: { onEnter?: () => void } = {}) {
  const { t, lang, setLang } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    // A real, shared counter across every visitor, not fake or per-browser.
    // Only increments once per browser session so refreshing the page (or
    // navigating back to this screen) doesn't inflate the count.
    const alreadyCounted = sessionStorage.getItem("wornwith:counted");
    const endpoint = alreadyCounted
      ? "https://api.countapi.xyz/get/wornwithcare-demo/passport-views"
      : "https://api.countapi.xyz/hit/wornwithcare-demo/passport-views";

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.value === "number") setViewCount(data.value);
        sessionStorage.setItem("wornwith:counted", "1");
      })
      .catch(() => {
        // Public API can be flaky/blocked (adblockers, offline demo, etc.)
        //, fail silently rather than show an error for something this minor.
      });
  }, []);

  const archiveNo = GARMENT.brandSku.split("-").pop();
  const dppNo = GARMENT.fullDppId.replace("#", "");

  // Brief exit transition: the front fades out, then the passport rises in
  // (each screen already has its own fade-up entrance). Skipped entirely for
  // reduced-motion users.
  const [leaving, setLeaving] = useState(false);
  const handleEnter = () => {
    if (leaving) return;
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onEnter?.();
      return;
    }
    setLeaving(true);
    setTimeout(() => onEnter?.(), 280);
  };

  return (
    <div
      className="h-full flex flex-col px-3 pb-3 text-center fade-up"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
    >
      <div
        className={`w-full h-full flex flex-col items-center border border-ink px-6 pt-6 pb-5 overflow-y-auto no-scrollbar transition-opacity duration-300 ease-out ${leaving ? "opacity-0" : "opacity-100"}`}
      >
        {/* Archive header: catalogue number left, language right */}
        <div className="w-full flex items-center justify-between font-sans text-[9.5px] uppercase tracking-[0.28em]">
          <span className="text-ink">{t("archive_label")} N° {archiveNo}</span>
          <div className="flex items-center gap-2 text-clay">
            {(["en", "fr", "pt"] as const).map((l, i) => (
              <span key={l} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>·</span>}
                <button
                  onClick={() => setLang(l)}
                  className={`uppercase tracking-[0.28em] ${lang === l ? "text-ink" : "opacity-60"}`}
                >
                  {l}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center py-[clamp(0.5rem,2.5dvh,1.5rem)]">
          <div style={{ perspective: "800px" }}>
            <img
              src="/images/wornwith-logo.webp"
              alt="Worn With Care"
              className="w-[clamp(6.5rem,26dvh,14rem)] [@media(max-height:700px)]:w-32 card-flip-lr"
            />
          </div>
          <div className="w-11 h-px bg-ink mt-[clamp(0.75rem,3.2dvh,1.75rem)]" />
          <h1 className="font-display italic text-[clamp(2.25rem,6dvh,3rem)] leading-tight text-ink mt-[clamp(0.75rem,2.8dvh,1.5rem)]">wornwith.care</h1>
          <p className="font-sans text-[9px] uppercase tracking-[0.34em] text-clay mt-[clamp(0.5rem,1.6dvh,0.875rem)] pl-[0.34em]">
            {t("welcome_by")}
          </p>
          <p className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.34em] text-[#D6336C] mt-[clamp(0.625rem,2dvh,1.125rem)] pl-[0.34em]">
            {t("archive_tagline")}
          </p>

          {/* The garment and its passport number. One tap opens the data note. */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowVerificationInfo(true); }}
            className="mt-[clamp(1rem,3.2dvh,1.75rem)] flex flex-col border border-line text-center max-w-full"
          >
            <span className="flex items-center justify-center gap-3 px-4 py-2">
              <img
                src={GARMENT.image}
                alt=""
                className="w-10 h-12 object-cover shrink-0 bg-[#F6F4F1] [@media(max-height:700px)]:hidden"
              />
              <span className="font-display italic text-lg leading-tight text-ink text-left">{GARMENT.name}</span>
            </span>
            <span className="border-t border-line px-3 py-1.5 font-sans text-[9px] uppercase tracking-[0.16em] text-clay leading-snug">
              {t("dpp_eyebrow")} · <span className="whitespace-nowrap">{dppNo} ›</span>
            </span>
          </button>
          <p className="font-sans text-[11px] text-clay leading-relaxed max-w-[17rem] text-balance mt-[clamp(0.5rem,1.8dvh,1rem)]">
            {t("welcome_tagline")}
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleEnter(); }}
          className="w-full max-w-md bg-ink text-white py-4 font-sans text-[10.5px] uppercase tracking-[0.36em] font-medium"
        >
          {t("enter_archive")}
        </button>

        {!showInfo ? (
          <button
            onClick={() => setShowInfo(true)}
            className="font-sans text-[9px] uppercase tracking-[0.24em] text-clay mt-4"
          >
            {t("what_is_this")}
          </button>
        ) : (
          <button
            onClick={() => setShowInfo(false)}
            className="bg-blush-pale/50 px-4 py-3 mt-4 fade-up text-left cursor-pointer"
          >
            <p className="font-sans text-[11px] text-ink/80 leading-relaxed">{t("dpp_explainer")}</p>
          </button>
        )}
        {viewCount !== null && (
          <p className="font-sans text-[9px] text-clay mt-3">
            {t("viewed_times")} <span className="text-ink font-medium">{viewCount.toLocaleString()}</span> {t("times_suffix")}
          </p>
        )}
      </div>
      <VerificationInfoPanel open={showVerificationInfo} onClose={() => setShowVerificationInfo(false)} />
    </div>
  );
}
