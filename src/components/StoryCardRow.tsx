import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";
import { loadOwnerStamps } from "../lib/stamps";
import { haptic } from "../lib/touches";

type Made = { blob: Blob; url: string; filename: string; isVideo: boolean };

// Share sheet row: makes the story card, a short video where the distance
// counts up and the stamps land, then shares it (as a file, straight into
// Instagram, Messages and so on, where the phone supports it) or saves it.
// Browsers that can't record video get the finished card as an image.
export function StoryCardRow() {
  const { t, lang } = useLanguage();
  const [state, setState] = useState<"idle" | "making" | "ready" | "error">("idle");
  const [made, setMade] = useState<Made | null>(null);
  const [still, setStill] = useState<Made | null>(null);

  useEffect(() => () => {
    if (made) URL.revokeObjectURL(made.url);
    if (still) URL.revokeObjectURL(still.url);
  }, [made, still]);

  const text = () => {
    const own = loadOwnerStamps().filter((s) => !s.from).length;
    return {
      eyebrow: t("story_card_eyebrow"),
      route: t("story_card_route"),
      stageLabels: [t("stamp_grown"), t("stamp_spun"), t("stamp_sewn"), t("stamp_arrived")],
      ownLine: own > 0 ? t(own === 1 ? "story_card_own_one" : "story_card_own").replace("{n}", String(own)) : undefined,
      locale: lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-PT" : "en-US",
    };
  };

  const make = async () => {
    setState("making");
    try {
      const card = await import("../lib/storyCard");
      const video = await card.renderStoryCardVideo(text()).catch(() => null);
      if (video && video.blob.size > 0) {
        setMade({ blob: video.blob, url: URL.createObjectURL(video.blob), filename: `${card.STORY_CARD_FILENAME}.${video.ext}`, isVideo: true });
      } else {
        const png = await card.renderStoryCard(text());
        setMade({ blob: png, url: URL.createObjectURL(png), filename: `${card.STORY_CARD_FILENAME}.png`, isVideo: false });
      }
      setState("ready");
      haptic(12);
    } catch {
      setState("error");
    }
  };

  const download = (m: Made) => {
    const a = document.createElement("a");
    a.href = m.url;
    a.download = m.filename;
    a.click();
  };

  const share = async () => {
    if (!made) return;
    const file = new File([made.blob], made.filename, { type: made.blob.type });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "wornwith.care" });
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    download(made);
  };

  const saveStill = async () => {
    if (still) return download(still);
    const card = await import("../lib/storyCard");
    const png = await card.renderStoryCard(text());
    const m = { blob: png, url: URL.createObjectURL(png), filename: `${card.STORY_CARD_FILENAME}.png`, isVideo: false };
    setStill(m);
    download(m);
  };

  return (
    <div className="py-3.5">
      <p className="font-sans text-[13px] text-ink font-medium">{t("story_card_title")}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("story_card_desc")}</p>
      {state !== "ready" || !made ? (
        <button onClick={make} disabled={state === "making"} className="font-sans text-[11px] font-medium mt-1.5 disabled:opacity-60" style={{ color: "#8E3D52" }}>
          {state === "making" ? t("story_card_making") : state === "error" ? t("pdf_error_label") : `→ ${t("story_card_action")}`}
        </button>
      ) : (
        <div className="mt-3 fade-up flex flex-col items-center">
          {made.isVideo ? (
            <video src={made.url} autoPlay loop muted playsInline className="w-[180px] rounded-xl border border-line shadow-sm bg-paper" aria-label={t("story_card_title")} />
          ) : (
            <img src={made.url} alt={t("story_card_title")} className="w-[180px] rounded-xl border border-line shadow-sm" />
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={share} className="rounded-full bg-ink text-cream px-5 py-2 font-sans text-[12px]">{t("story_card_share")}</button>
            <button onClick={() => download(made)} className="rounded-full border border-line px-5 py-2 font-sans text-[12px] text-ink">
              {t(made.isVideo ? "story_card_save_video" : "story_card_save")}
            </button>
          </div>
          {made.isVideo && (
            <button onClick={saveStill} className="mt-2 font-sans text-[11px] text-clay underline underline-offset-2 py-1">{t("story_card_save")}</button>
          )}
        </div>
      )}
    </div>
  );
}
