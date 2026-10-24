// On the website the API lives on the same site. Inside the iPhone app the
// pages come from the app bundle, so calls go to wornwith.care itself.
// The app's native layer puts `window.Capacitor` on the page, so the website
// can tell where it is running without loading the Capacitor library.
const SITE = "https://wornwith.care";

export const isNativeApp = (): boolean => {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
};

export const apiUrl = (path: string): string => (isNativeApp() ? `${SITE}${path}` : path);
