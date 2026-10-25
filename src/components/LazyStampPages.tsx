import { useEffect, useState } from "react";
import { loadable } from "../lib/loadable";
import { OPEN, OPEN_OWN, setPendingOpen } from "../lib/stamps";
import { readHandoverFromHash } from "../lib/handover";

// The stamp pages and the handover welcome are hidden until someone finds
// them, so their code loads only then. The first "open" is caught here and
// remembered; each page checks for it as it mounts.
// Each page is fetched before it is shown, so a tap without a connection
// does nothing rather than breaking the app; the next tap tries again.
const StampsPage = loadable(() => import("./PassportStamps").then((m) => m.StampsPage));
const YourStampsPage = loadable(() => import("./PassportStamps").then((m) => m.YourStampsPage));
const HandoverWelcome = loadable(() => import("./Handover").then((m) => m.HandoverWelcome));

export function LazyStampPages({ onGoTo, ready }: { onGoTo: (screen: number) => void; ready: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const handover = typeof window !== "undefined" && !!readHandoverFromHash(window.location.hash);

  useEffect(() => {
    if (loaded) return;
    const catchFirst = (e: Event) => {
      const kind = e.type;
      Promise.all([StampsPage.preload(), YourStampsPage.preload()]).then(
        () => { setPendingOpen(kind); setLoaded(true); },
        () => undefined,
      );
    };
    window.addEventListener(OPEN, catchFirst);
    window.addEventListener(OPEN_OWN, catchFirst);
    return () => { window.removeEventListener(OPEN, catchFirst); window.removeEventListener(OPEN_OWN, catchFirst); };
  }, [loaded]);

  return (
    <>
      {(loaded || handover) && (
        <>
          <StampsPage onGoTo={onGoTo} />
          <YourStampsPage />
        </>
      )}
      {handover && <HandoverWelcome ready={ready} />}
    </>
  );
}
