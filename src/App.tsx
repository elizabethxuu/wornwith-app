import { useEffect, useState } from "react";
import DeckPreview from "./DeckPreview";
import LiveApp from "./LiveApp";
import PrintableTag from "./screens/PrintableTag";
import { LanguageProvider } from "./lib/i18n";

type Mode = "deck" | "live" | "tag";

function resolveMode(): Mode {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("mode");
  if (forced === "deck" || forced === "live" || forced === "tag") return forced;

  // No explicit mode: real visitors (who just scanned the tag on their
  // phone) land in the live app. Wider screens default to the presenter
  // deck, since that's almost always someone reviewing the design on a
  // laptop rather than a person who just scanned a garment.
  return window.innerWidth < 768 ? "live" : "deck";
}

export default function App() {
  const [mode, setMode] = useState<Mode>(resolveMode);

  useEffect(() => {
    const onResize = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("mode")) setMode(resolveMode());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (mode === "live") return <LanguageProvider><LiveApp /></LanguageProvider>;
  if (mode === "tag") return <LanguageProvider><PrintableTag /></LanguageProvider>;
  return <LanguageProvider><DeckPreview /></LanguageProvider>;
}
