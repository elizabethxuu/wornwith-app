import type { TranslationKey } from "./i18n";

// Small per-visitor layout choices (tool row open, footer hidden). Stored in
// the browser only; if storage is blocked the defaults simply apply.

export function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}

export function saveFlag(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
}

export const TOOLS_OPEN_KEY = "ww.toolsOpen";
export const FOOTER_HIDDEN_KEY = "ww.footerHidden";

export type LegalPage = "privacy" | "terms" | "accessibility" | "release-notes" | "about-passport";

// The legal and about pages, shown in the footer and again in the menu.
export const LEGAL_LINKS: [TranslationKey, LegalPage][] = [
  ["footer_privacy", "privacy"],
  ["footer_terms", "terms"],
  ["footer_accessibility", "accessibility"],
  ["footer_release_notes", "release-notes"],
  ["footer_about_passport", "about-passport"],
];
