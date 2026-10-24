import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { loadOwnerStamps } from "../lib/stamps";
import { haptic } from "../lib/touches";

// Share sheet row: makes the story card, shows it, then shares it (as an
// image file, straight into Instagram, Messages and so on, where the
// phone supports it) or saves it.
export function StoryCardRow() {
  const { t, lang } = useLanguage();
  const [state, setState] = useState<"idle" | "making" | "ready" | "error">("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("wornwith-care.png");

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const make = async () => {
    setState("making");
    try {
      const { renderStoryCard, STORY_CARD_FILENAME } = await import("../lib/storyCard");
      const own = loadOwnerStamps().filter((s) => !s.from).length;
      const b = await renderStoryCard({
        eyebrow: t("story_card_eyebrow"),
        route: t("story_card_route"),
        stageLabels: [t("stamp_grown"), t("stamp_spun"), t("stamp_sewn"), t("stamp_arrived")],
        ownLine: own > 0 ? t(own === 1 ? "story_card_own_one" : "story_card_own").replace("{n}", String(own)) : undefined,
        coatName: t("story_card_coat"),
        footer: t("story_card_footer"),
        locale: lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-PT" : "en-US",
      });
      setBlob(b);
      setUrl(URL.createObjectURL(b));
      setFilename(STORY_CARD_FILENAME);
      setState("ready");
      haptic(12);
    } catch {
      setState("error");
    }
  };

  const save = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], filename, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "wornwith.care" });
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    save();
  };

  return (
    <div className="py-3.5">
      <p className="font-sans text-[13px] text-ink font-medium">{t("story_card_title")}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("story_card_desc")}</p>
      {state !== "ready" ? (
        <button onClick={make} disabled={state === "making"} className="font-sans text-[11px] font-medium mt-1.5 disabled:opacity-60" style={{ color: "#8E3D52" }}>
          {state === "making" ? t("story_card_making") : state === "error" ? t("pdf_error_label") : `→ ${t("story_card_action")}`}
        </button>
      ) : (
        <div className="mt-3 fade-up flex flex-col items-center">
          {url && <img src={url} alt={t("story_card_title")} className="w-[180px] rounded-xl border border-line shadow-sm" />}
          <div className="flex gap-2 mt-3">
            <button onClick={share} className="rounded-full bg-ink text-cream px-5 py-2 font-sans text-[12px]">{t("story_card_share")}</button>
            <button onClick={save} className="rounded-full border border-line px-5 py-2 font-sans text-[12px] text-ink">{t("story_card_save")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
