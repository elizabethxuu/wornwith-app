import { useEffect, useState } from "react";
import { useLanguage } from "../lib/i18n";

// This row's own words, loaded with it only when the share sheet opens.
const SC = {
  sc_title: { en: "For your Instagram Story", fr: "Pour votre story Instagram", pt: "Para a sua história do Instagram" },
  sc_desc: { en: "One image of its life so far: 21,400 km, four countries and every wear.", fr: "Une image de sa vie jusqu'ici : 21 400 km, quatre pays et chaque fois porté.", pt: "Uma imagem da sua vida até agora: 21.400 km, quatro países e cada vez que foi usado." },
  sc_action: { en: "Make the card", fr: "Créer la carte", pt: "Criar o cartão" },
  sc_making: { en: "Making the card…", fr: "Création de la carte…", pt: "A criar o cartão…" },
  sc_share: { en: "Share", fr: "Partager", pt: "Partilhar" },
  sc_save: { en: "Save image", fr: "Enregistrer l'image", pt: "Guardar imagem" },
  sc_error: { en: "Couldn't make the card. Try again.", fr: "Impossible de créer la carte. Réessayez.", pt: "Não foi possível criar o cartão. Tente de novo." },
  sc_alt: { en: "Story card: the coat's journey of 21,400 km through four countries", fr: "Carte story : le voyage du manteau, 21 400 km à travers quatre pays", pt: "Cartão de história: a viagem do casaco, 21.400 km por quatro países" },
} as const;

type Card = { url: string; file: File };

// A row in the share sheet: makes the story card, shows it, then shares it
// to Instagram (or anywhere) through the phone's own share menu, or saves it.
export default function StoryCardRow() {
  const { lang } = useLanguage();
  const t = (k: keyof typeof SC) => SC[k][lang];
  const [state, setState] = useState<"idle" | "making" | "ready" | "error">("idle");
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => () => { if (card) URL.revokeObjectURL(card.url); }, [card]);

  const make = async () => {
    setState("making");
    try {
      const { makeStoryCard } = await import("../lib/storyCard");
      const made = await makeStoryCard(lang);
      setCard({ url: made.url, file: made.file });
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const canShare = (() => {
    if (!card || typeof navigator === "undefined" || !navigator.canShare) return false;
    try { return navigator.canShare({ files: [card.file] }); } catch { return false; }
  })();

  const share = async () => {
    if (!card) return;
    try {
      await navigator.share({ files: [card.file] });
    } catch {
      // The person closed the share menu; nothing to do.
    }
  };

  return (
    <div className="py-3.5">
      <p className="font-sans text-[13px] text-ink font-medium">{t("sc_title")}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("sc_desc")}</p>
      {state !== "ready" && (
        <button
          onClick={make}
          disabled={state === "making"}
          className="font-sans text-[11px] font-medium mt-1.5 disabled:opacity-60"
          style={{ color: "#8E3D52" }}
        >
          {state === "making" ? t("sc_making") : state === "error" ? t("sc_error") : `→ ${t("sc_action")}`}
        </button>
      )}
      {state === "ready" && card && (
        <div className="mt-3 flex items-end gap-4 fade-up">
          <img
            src={card.url}
            alt={t("sc_alt")}
            className="w-[108px] aspect-[9/16] rounded-[10px] border border-line object-cover shadow-sm"
          />
          <div className="flex flex-col gap-2 pb-1">
            {canShare && (
              <button
                onClick={share}
                className="rounded-full bg-ink text-cream px-5 py-2.5 font-sans text-[12px]"
              >
                {t("sc_share")}
              </button>
            )}
            <a
              href={card.url}
              download="wornwith-story-card.png"
              className="rounded-full border border-line px-5 py-2.5 font-sans text-[12px] text-ink text-center"
            >
              {t("sc_save")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
