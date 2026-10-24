import { lazy, Suspense, useEffect, useState } from "react";
import { OPEN, OPEN_OWN, setPendingOpen } from "../lib/stamps";
import { readHandoverFromHash } from "../lib/handover";

// The stamp pages and the handover welcome are hidden until someone finds
// them, so their code loads only then. The first "open" is caught here and
// remembered; each page checks for it as it mounts.
const StampsPage = lazy(() => import("./PassportStamps").then((m) => ({ default: m.StampsPage })));
const YourStampsPage = lazy(() => import("./PassportStamps").then((m) => ({ default: m.YourStampsPage })));
const HandoverWelcome = lazy(() => import("./Handover").then((m) => ({ default: m.HandoverWelcome })));

export function LazyStampPages({ onGoTo, ready }: { onGoTo: (screen: number) => void; ready: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const handover = typeof window !== "undefined" && !!readHandoverFromHash(window.location.hash);

  useEffect(() => {
    if (loaded) return;
    const catchFirst = (e: Event) => { setPendingOpen(e.type); setLoaded(true); };
    window.addEventListener(OPEN, catchFirst);
    window.addEventListener(OPEN_OWN, catchFirst);
    return () => { window.removeEventListener(OPEN, catchFirst); window.removeEventListener(OPEN_OWN, catchFirst); };
  }, [loaded]);

  return (
    <Suspense fallback={null}>
      {(loaded || handover) && (
        <>
          <StampsPage onGoTo={onGoTo} />
          <YourStampsPage />
        </>
      )}
      {handover && <HandoverWelcome ready={ready} />}
    </Suspense>
  );
}
