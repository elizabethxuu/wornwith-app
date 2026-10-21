import { lazy, Suspense, useState } from "react";
import LiveApp from "./LiveApp";
import { LanguageProvider } from "./lib/i18n";

// The presenter deck and printable tag are rarely used, so they load on demand.
const DeckPreview = lazy(() => import("./DeckPreview"));
const PrintableTag = lazy(() => import("./screens/PrintableTag"));

type Mode = "deck" | "live" | "tag";

function resolveMode(): Mode {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("mode");
  if (forced === "deck" || forced === "live" || forced === "tag") return forced;

  // No explicit mode: everyone, on any screen size, lands in the real app.
  // The presenter deck is still available at ?mode=deck.
  return "live";
}

export default function App() {
  const [mode] = useState<Mode>(resolveMode);

  if (mode === "live") return <LanguageProvider><LiveApp /></LanguageProvider>;
  if (mode === "tag") return <LanguageProvider><Suspense fallback={null}><PrintableTag /></Suspense></LanguageProvider>;
  return <LanguageProvider><Suspense fallback={null}><DeckPreview /></Suspense></LanguageProvider>;
}
