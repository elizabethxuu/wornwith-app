import { registerPlugin } from "@capacitor/core";
import { isNativeApp } from "./apiBase";
import { classifyTag, type TagVerdict } from "./nfcTag";

// Inside the iPhone app the coat's tag is read by the WornNFC plugin
// (ios/App/App/AppDelegate.swift); nfcTag.ts decides what a read means.

type WornNFCPlugin = {
  isAvailable(): Promise<{ available: boolean }>;
  scan(options?: { message?: string }): Promise<{ urls: string[]; texts: string[] }>;
};

const WornNFC = registerPlugin<WornNFCPlugin>("WornNFC");

export type ScanResult = TagVerdict | { state: "cancelled" } | { state: "unavailable" } | { state: "error" };

export async function nfcAvailable(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    return (await WornNFC.isAvailable()).available;
  } catch {
    return false;
  }
}

export async function scanCoatTag(expectedDpp: string, message: string): Promise<ScanResult> {
  try {
    const { urls, texts } = await WornNFC.scan({ message });
    return classifyTag(urls ?? [], texts ?? [], expectedDpp);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "CANCELLED") return { state: "cancelled" };
    if (code === "UNAVAILABLE") return { state: "unavailable" };
    return { state: "error" };
  }
}
