import { useEffect, useState, type ComponentType, type ReactNode } from "react";

// Parts of the app that download only when they're needed (the map, the
// stamp pages, two rows of the Share menu).
//
// React.lazy keeps a failed download for the rest of the visit and throws it
// up the page, so losing signal at the wrong moment blanked the whole app.
// This loader never throws: while loading it shows `loading`, if the download
// fails it shows `offline` (with a retry), and it tries again by itself as
// soon as the connection comes back.
type Options = {
  loading?: ReactNode;
  offline?: (retry: () => void) => ReactNode;
};

export type Loadable<P> = ComponentType<P> & { preload: () => Promise<ComponentType<P>> };

export function loadable<P extends object>(load: () => Promise<ComponentType<P>>, opts: Options = {}): Loadable<P> {
  let cached: ComponentType<P> | null = null;
  let pending: Promise<ComponentType<P>> | null = null;
  const preload = () =>
    (pending ??= load().then(
      (c) => (cached = c),
      (e) => {
        pending = null; // a later attempt downloads again
        throw e;
      },
    ));

  function Loaded(props: P) {
    const [Comp, setComp] = useState<ComponentType<P> | null>(() => cached);
    const [failed, setFailed] = useState(false);
    const [tries, setTries] = useState(0);

    useEffect(() => {
      if (Comp) return;
      let live = true;
      const attempt = () =>
        preload().then(
          (c) => { if (live) { setComp(() => c); setFailed(false); } },
          () => { if (live) setFailed(true); },
        );
      attempt();
      window.addEventListener("online", attempt);
      return () => {
        live = false;
        window.removeEventListener("online", attempt);
      };
    }, [Comp, tries]);

    if (Comp) return <Comp {...props} />;
    if (failed && opts.offline) return <>{opts.offline(() => setTries((n) => n + 1))}</>;
    return <>{opts.loading ?? null}</>;
  }

  return Object.assign(Loaded, { preload });
}
