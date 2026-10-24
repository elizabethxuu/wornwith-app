import { isNativeApp } from "./apiBase";
import { classifyTag, type TagVerdict } from "./nfcTag";

// Inside the iPhone app the coat's tag is read by the WornNFC plugin
// (ios/App/App/AppDelegate.swift); nfcTag.ts decides what a read means.

type WornNFCPlugin = {
  isAvailable(): Promise<{ available: boolean }>;
  scan(options?: { message?: string }): Promise<{ urls: string[]; texts: string[] }>;
};

// Loaded only inside the app, so the website never ships the Capacitor library.
// The plugin is a proxy that answers every property (even `then`), so it is
// wrapped in a plain object rather than resolved from a promise directly.
let loaded: Promise<{ nfc: WornNFCPlugin }> | null = null;
const load = () =>
  (loaded ??= import("@capacitor/core").then(({ registerPlugin }) => ({ nfc: registerPlugin<WornNFCPlugin>("WornNFC") })));

export type ScanResult = TagVerdict | { state: "cancelled" } | { state: "unavailable" } | { state: "error" };

export async function nfcAvailable(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const { nfc } = await load();
    return (await nfc.isAvailable()).available;
  } catch {
    return false;
  }
}

export async function scanCoatTag(expectedDpp: string, message: string): Promise<ScanResult> {
  try {
    const { nfc } = await load();
    const { urls, texts } = await nfc.scan({ message });
    return classifyTag(urls ?? [], texts ?? [], expectedDpp);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "CANCELLED") return { state: "cancelled" };
    if (code === "UNAVAILABLE") return { state: "unavailable" };
    return { state: "error" };
  }
}
