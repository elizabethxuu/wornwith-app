import { isNativeApp } from "./apiBase";
import { loadOwnershipRecord } from "./persistence";
import { remindersOn } from "./reminders";
import { GARMENT } from "./garment";

// Keeps the iPhone home-screen widget up to date: the wear count, the
// language and whether reminders are on. The widget works out the next care
// step on its own. Only inside the app; on the website this does nothing.

type WornWidgetPlugin = { sync(o: { worn: number; lang: string; reminders: boolean }): Promise<void> };

// The plugin is a proxy that answers every property (even `then`), so it is
// wrapped in a plain object rather than resolved from a promise directly.
let loaded: Promise<{ widget: WornWidgetPlugin }> | null = null;
const load = () =>
  (loaded ??= import("@capacitor/core").then(({ registerPlugin }) => ({ widget: registerPlugin<WornWidgetPlugin>("WornWidget") })));

export async function syncWidget(lang: string): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const n = parseInt(String(loadOwnershipRecord().wearCount || GARMENT.timesWorn).replace(/[^0-9]/g, ""), 10);
    const { widget } = await load();
    await widget.sync({ worn: Number.isFinite(n) ? n : 0, lang, reminders: remindersOn() });
  } catch {
    // An older build without the widget: nothing to update.
  }
}
