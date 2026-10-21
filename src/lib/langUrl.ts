// Pure helpers for the language-in-the-URL behavior (wornwith.care/en, /fr, /pt).
// Kept free of React and window access so they can be tested on their own.

export type Lang = "en" | "fr" | "pt";

export const LANGS: Lang[] = ["en", "fr", "pt"];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value);
}

// The language named by the first path segment, or null when there is none.
export function langFromPathname(pathname: string): Lang | null {
  const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return isLang(seg) ? seg : null;
}

// The address for the same page in another language. Keeps any nested path,
// query string and hash, and swaps (or adds) the language segment.
export function localizedUrl(lang: Lang, loc: { pathname: string; search: string; hash: string }): string {
  const rest = loc.pathname.split("/").filter(Boolean);
  if (isLang(rest[0])) rest.shift();
  return `/${[lang, ...rest].join("/")}${loc.search}${loc.hash}`;
}
