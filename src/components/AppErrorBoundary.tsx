import { Component, type ReactNode } from "react";

// The last line of defence: if anything in the app throws while drawing,
// show a calm message with a way back instead of a blank page.
const COPY = {
  en: { title: "Something went wrong.", body: "The passport is fine. Reload to carry on.", action: "Reload" },
  fr: { title: "Un problème est survenu.", body: "Le passeport est intact. Rechargez pour continuer.", action: "Recharger" },
  pt: { title: "Algo correu mal.", body: "O passaporte está bem. Recarregue para continuar.", action: "Recarregar" },
};

function lang(): keyof typeof COPY {
  const seg = typeof window === "undefined" ? "" : window.location.pathname.split("/").filter(Boolean)[0];
  return seg === "fr" || seg === "pt" ? seg : "en";
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App error", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const c = COPY[lang()];
    return (
      <main className="min-h-[100dvh] bg-cream text-ink flex flex-col items-center justify-center gap-4 px-8 text-center">
        <img src="/images/wornwith-logo-sm.webp" alt="" className="h-9 w-auto" />
        <h1 className="font-display italic text-[28px] leading-snug">{c.title}</h1>
        <p className="font-sans text-[14px] text-clay max-w-xs leading-relaxed">{c.body}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-ink text-cream px-6 py-3 font-sans text-[13px] font-medium"
        >
          {c.action}
        </button>
      </main>
    );
  }
}
