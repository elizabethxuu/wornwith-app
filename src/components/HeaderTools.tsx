import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, AudioLines, Moon, Sun, Globe, X as CloseIcon } from "lucide-react";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { loadWardrobe } from "../lib/persistence";
import { searchEntries, type SearchEntry } from "../lib/searchIndex";
import type { Theme } from "../lib/theme";

// Live screen numbers: 1 overview, 2 journey, 3 materials, 4 care,
// 5 environment, 7 story, 8 ownership, 9 wardrobe.
const SECTIONS: { key: TranslationKey; hint: TranslationKey; screen: number }[] = [
  { key: "contents_overview", hint: "search_hint_overview", screen: 1 },
  { key: "contents_journey", hint: "search_hint_journey", screen: 2 },
  { key: "contents_materials", hint: "search_hint_materials", screen: 3 },
  { key: "contents_care", hint: "search_hint_care", screen: 4 },
  { key: "contents_environment", hint: "search_hint_environment", screen: 5 },
  { key: "contents_story", hint: "search_hint_story", screen: 7 },
  { key: "contents_ownership", hint: "search_hint_ownership", screen: 8 },
  { key: "section_wardrobe", hint: "search_hint_wardrobe", screen: 9 },
];
const WARDROBE_SCREEN = 9;
const LANGS = ["en", "fr", "pt"] as const;

const iconBtn = "w-10 h-10 items-center justify-center text-ink rounded-full";

export function SearchSheet({ open, onClose, onGoTo }: { open: boolean; onClose: () => void; onGoTo: (screen: number) => void }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { sections, garments } = useMemo(() => {
    const sectionEntries: SearchEntry[] = SECTIONS.map((s) => ({ id: s.key, label: t(s.key), hint: t(s.hint), screen: s.screen }));
    const garmentEntries: SearchEntry[] = open
      ? loadWardrobe().map((g, i) => ({
          id: `g${i}`,
          label: g.nameKey ? t(g.nameKey) || g.name : g.name,
          hint: `${g.brand ?? ""} ${g.nameKey && g.noteKey ? t(g.noteKey) : g.note}`,
          screen: WARDROBE_SCREEN,
        }))
      : [];
    return { sections: searchEntries(sectionEntries, query), garments: searchEntries(garmentEntries, query) };
    // t changes with the language, which is what should refresh the index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, t]);

  if (!open) return null;
  const go = (screen: number) => { onClose(); onGoTo(screen); };
  const none = query.trim() !== "" && sections.length === 0 && garments.length === 0;

  return createPortal(
    <div className="fixed inset-0 h-[100dvh] w-full z-50">
      <button type="button" aria-label={t("close_label")} className="absolute inset-0 w-full h-full bg-ink/45" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("tool_search")}
        className="absolute top-0 inset-x-0 md:max-w-[520px] md:mx-auto max-h-[80dvh] overflow-y-auto bg-paper rounded-b-[24px] border-b border-line px-5 pb-5 fade-up"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="flex items-center gap-3 border-b border-line pb-2">
          <Search size={18} strokeWidth={1.5} className="text-clay shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("tool_search_placeholder")}
            aria-label={t("tool_search_placeholder")}
            className="flex-1 min-w-0 bg-transparent font-sans text-[14px] text-ink placeholder:text-clay/70 outline-none py-2"
          />
          <button onClick={onClose} aria-label={t("close_label")} className="w-8 h-8 flex items-center justify-center text-clay">
            <CloseIcon size={18} strokeWidth={1.5} />
          </button>
        </div>
        <ul className="mt-2" aria-live="polite">
          {sections.map((e) => (
            <li key={e.id}>
              <button onClick={() => go(e.screen)} className="w-full text-left py-3 border-b border-line/70 font-display italic text-[1.25rem] text-ink">
                {e.label}
              </button>
            </li>
          ))}
          {garments.length > 0 && (
            <li className="pt-4 pb-1 font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("tool_search_wardrobe")}</li>
          )}
          {garments.map((e) => (
            <li key={e.id}>
              <button onClick={() => go(e.screen)} className="w-full text-left py-3 border-b border-line/70 font-sans text-[13px] text-ink">
                {e.label}
              </button>
            </li>
          ))}
        </ul>
        {none && <p className="py-4 font-sans text-[12px] text-clay">{t("tool_search_none")}</p>}
      </section>
    </div>,
    document.body
  );
}

/**
 * Voice, theme and language, sitting in the main header to the left of
 * Share. On phones only the language switch shows; voice and theme move into
 * the menu so the header stays on one line.
 */
export default function HeaderTools({
  onGoTo,
  theme,
  onToggleTheme,
}: {
  onGoTo: (screen: number) => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const { t, lang, setLang } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLangOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [langOpen]);

  return (
    <>
      <button onClick={() => onGoTo(WARDROBE_SCREEN)} aria-label={t("tool_voice")} title={t("tool_voice")} className={`${iconBtn} hidden md:flex`}>
        <AudioLines size={19} strokeWidth={1.25} />
      </button>
      <button
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? t("tool_light") : t("tool_dark")}
        title={theme === "dark" ? t("tool_light") : t("tool_dark")}
        aria-pressed={theme === "dark"}
        className={`${iconBtn} hidden md:flex`}
      >
        {theme === "dark" ? <Sun size={18} strokeWidth={1.25} /> : <Moon size={18} strokeWidth={1.25} />}
      </button>
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setLangOpen((o) => !o)}
          aria-label={t("tool_language")}
          aria-expanded={langOpen}
          className="h-10 w-10 md:w-auto md:pl-1.5 md:pr-2 flex items-center justify-center gap-1 text-ink rounded-full"
        >
          <Globe size={18} strokeWidth={1.25} />
          <span className="hidden md:inline font-sans text-[10px] uppercase tracking-[0.18em]">{lang}</span>
        </button>
        {langOpen && (
          <div role="group" aria-label={t("tool_language")} className="absolute right-0 top-full mt-1 z-40 min-w-[88px] bg-paper border border-line rounded-[14px] shadow-[0_10px_30px_-12px_rgba(43,38,34,0.35)] py-1">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setLangOpen(false); }}
                aria-pressed={lang === l}
                className={`w-full text-left px-4 py-2.5 font-sans text-[11px] uppercase tracking-[0.22em] ${lang === l ? "text-ink font-semibold" : "text-clay"}`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
