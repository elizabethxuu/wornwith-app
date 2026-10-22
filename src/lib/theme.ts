// Light / dark theme, kept free of React so it can be tested on its own.
// The choice is saved in this browser only. No saved choice means light.
export type Theme = "light" | "dark";
export const THEME_KEY = "wornwith:theme";

export function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark";
}

export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#14110F" : "#FBF9F6");
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore: the choice still applies for this visit
  }
}
