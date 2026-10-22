import { useEffect, useState } from "react";
import { Menu as MenuIcon, X as CloseIcon, Share } from "lucide-react";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ShareSheet } from "./UI";
import HeaderTools from "./HeaderTools";

// Screen numbers match the live app: 1 overview, 2 journey, 3 materials,
// 4 care, 5 environment, 7 story, 8 ownership.
const MENU_ITEMS: [TranslationKey, number][] = [
  ["contents_overview", 1],
  ["contents_journey", 2],
  ["contents_materials", 3],
  ["contents_care", 4],
  ["contents_environment", 5],
  ["contents_ownership", 8],
  ["contents_story", 7],
];

/**
 * The header that stays on every passport screen: menu on the left, logo and
 * wordmark in the middle, share on the right. It owns the menu and share
 * sheet so every screen gets the same behaviour. The menu is an absolute
 * layer, so the parent must be `relative`.
 */
export default function PassportTopBar({
  onGoTo,
  safeArea = true,
  overlayClassName = "top-0",
  showTools = false,
}: {
  onGoTo: (screen: number) => void;
  safeArea?: boolean;
  overlayClassName?: string;
  showTools?: boolean;
}) {
  const { t, lang, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const barStyle = safeArea ? { paddingTop: "max(env(safe-area-inset-top), 0.5rem)" } : { paddingTop: "0.25rem" };
  const brand = (
    <div className="flex items-center gap-2">
      <img src="/images/wornwith-logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
      <p className="font-display italic text-[clamp(1.4rem,6.4vw,1.9rem)] leading-none text-ink">wornwith.care</p>
    </div>
  );

  return (
    <>
      <div
        className={`shrink-0 flex items-center justify-between px-3 pb-2 bg-paper print:hidden ${showTools ? "" : "border-b border-line"}`}
        style={barStyle}
      >
        <button
          onClick={() => setMenuOpen(true)}
          aria-label={t("hero_menu")}
          className="w-10 h-10 flex items-center justify-center text-ink"
        >
          <MenuIcon size={22} strokeWidth={1.25} />
        </button>
        <button onClick={() => onGoTo(1)} aria-label={`wornwith.care, ${t("contents_overview")}`} className="flex items-center">
          {brand}
        </button>
        <button
          onClick={() => setShareOpen(true)}
          aria-label={t("contents_share")}
          className="w-10 h-10 flex items-center justify-center text-ink"
        >
          <Share size={20} strokeWidth={1.25} />
        </button>
      </div>
      {showTools && <HeaderTools onGoTo={onGoTo} />}

      {menuOpen && (
        <div className={`absolute inset-x-0 bottom-0 ${overlayClassName} z-30 bg-paper flex flex-col fade-up`}>
          <div
            className="shrink-0 flex items-center justify-between px-3 pb-2 border-b border-line"
            style={barStyle}
          >
            <button
              onClick={() => setMenuOpen(false)}
              aria-label={t("close_label")}
              className="w-10 h-10 flex items-center justify-center text-ink"
            >
              <CloseIcon size={22} strokeWidth={1.25} />
            </button>
            {brand}
            <div className="w-10 h-10" aria-hidden="true" />
          </div>
          <nav className="flex-1 overflow-y-auto px-6 pt-8 max-w-md w-full mx-auto">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay mb-2">{t("contents_title")}</p>
            <div className="border-t border-line">
              {MENU_ITEMS.map(([key, screen], i) => (
                <button
                  key={key}
                  onClick={() => { setMenuOpen(false); onGoTo(screen); }}
                  className="w-full flex items-baseline gap-4 py-3.5 border-b border-line text-left"
                >
                  <span className="font-sans text-[10px] tracking-[0.2em] text-clay w-5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display italic text-[1.5rem] leading-tight text-ink">{t(key)}</span>
                </button>
              ))}
              <button
                onClick={() => { setMenuOpen(false); setShareOpen(true); }}
                className="w-full flex items-baseline gap-4 py-3.5 border-b border-line text-left"
              >
                <span className="font-sans text-[10px] tracking-[0.2em] text-clay w-5">+</span>
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink">{t("contents_share")}</span>
              </button>
            </div>
            <div className="mt-8 flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.28em] text-clay" role="group" aria-label="Language">
              {(["en", "fr", "pt"] as const).map((l, k) => (
                <span key={l} className="flex items-center gap-3">
                  {k > 0 && <span aria-hidden>·</span>}
                  <button
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`uppercase tracking-[0.28em] py-2 ${lang === l ? "text-ink" : "opacity-60"}`}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>
          </nav>
        </div>
      )}
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
