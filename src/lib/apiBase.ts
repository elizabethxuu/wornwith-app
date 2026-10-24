import { Capacitor } from "@capacitor/core";

// On the website the API lives on the same site. Inside the iPhone app the
// pages come from the app bundle, so calls go to wornwith.care itself.
const SITE = "https://wornwith.care";
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();
export const apiUrl = (path: string): string => (isNativeApp() ? `${SITE}${path}` : path);
