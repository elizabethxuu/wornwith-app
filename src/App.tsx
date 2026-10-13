import { useState } from "react";
import DeckPreview from "./DeckPreview";
import LiveApp from "./LiveApp";
import PrintableTag from "./screens/PrintableTag";
import { LanguageProvider } from "./lib/i18n";

type Mode = "deck" | "live" | "tag";

function resolveMode(): Mode {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("mode");
  if (forced === "deck" || forced === "live" || forced === "tag") return forced;

  // The real passport is the default at every screen size.
  // The presentation deck remains available through ?mode=deck.
  return "live";
}

export default function App() {
  const [mode] = useState<Mode>(resolveMode);

  if (mode === "live") return <LanguageProvider><LiveApp /></LanguageProvider>;
  if (mode === "tag") return <LanguageProvider><PrintableTag /></LanguageProvider>;
  return <LanguageProvider><DeckPreview /></LanguageProvider>;
}
