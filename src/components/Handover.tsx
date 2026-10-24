import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/i18n";
import { GARMENT } from "../lib/garment";
import { passportUrl } from "../lib/config";
import { acceptHandover, chapterNumber, createHandoverUrl, readHandoverFromHash, MAX_HANDOVER_NOTE, MAX_NAME, type Handover } from "../lib/handover";
import { loadOwnerStamps, openYourStampsPage } from "../lib/stamps";
import { haptic, paperSound } from "../lib/touches";

// Share sheet row: write a note to whoever has the coat next, and send
// them the passport with it.
export function HandoverRow() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [note, setNote] = useState("");
  const [include, setInclude] = useState(true);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ownCount = loadOwnerStamps().length;

  const make = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = createHandoverUrl(passportUrl(lang, GARMENT.dppId, window.location.origin), { from, note, includeStamps: include });
    setLink(url);
    haptic(12);
    try {
      if (navigator.share) {
        await navigator.share({ title: t("handover_share_title"), text: t("handover_share_text"), url });
        return;
      }
    } catch {
      return;
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* the link is shown below */ }
  };

  return (
    <div className="py-3.5">
      <p className="font-sans text-[13px] text-ink font-medium">{t("handover_title")}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("handover_desc")}</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="font-sans text-[11px] font-medium mt-1.5" style={{ color: "#8E3D52" }}>
          → {t("handover_action")}
        </button>
      ) : (
        <form onSubmit={make} className="mt-3 space-y-3 fade-up">
          <input
            value={from}
            maxLength={MAX_NAME}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={t("handover_name_ph")}
            aria-label={t("handover_name_ph")}
            className="w-full border-b border-line bg-transparent py-2 font-sans text-[13px] text-ink outline-none focus:border-[#8E3D52]"
          />
          <textarea
            value={note}
            maxLength={MAX_HANDOVER_NOTE}
            rows={3}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("handover_note_ph")}
            aria-label={t("handover_note_ph")}
            className="w-full border border-line rounded-xl bg-transparent p-3 font-display italic text-[16px] text-ink outline-none focus:border-[#8E3D52] resize-none"
          />
          {ownCount > 0 && (
            <label className="flex items-center gap-2 font-sans text-[12px] text-ink">
              <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} className="accent-[#8E3D52]" />
              {t("handover_include").replace("{n}", String(ownCount))}
            </label>
          )}
          <p className="font-sans text-[10px] text-clay leading-relaxed">{t("handover_privacy")}</p>
          <button type="submit" className="rounded-full bg-ink text-cream px-5 py-2.5 font-sans text-[12px]">{t("handover_submit")}</button>
          {link && (
            <p className="font-sans text-[11px] text-clay break-all">
              {copied ? `${t("link_copied_confirmation")} ` : ""}
              <a href={link} className="underline underline-offset-2">{t("handover_link_label")}</a>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

// What the next owner sees when they open a handover link.
export function HandoverWelcome({ ready }: { ready: boolean }) {
  const { t } = useLanguage();
  const [h, setH] = useState<Handover | null>(null);

  useEffect(() => {
    if (!ready) return;
    const found = readHandoverFromHash(window.location.hash);
    if (found) { setH(found); paperSound(); }
  }, [ready]);

  if (!h) return null;
  const name = h.from || t("handover_someone");
  const clearHash = () => history.replaceState(null, "", window.location.pathname + window.location.search);
  const begin = () => {
    acceptHandover(h, t("handover_someone"));
    clearHash();
    setH(null);
    haptic(18);
    if (h.stamps.length) setTimeout(openYourStampsPage, 350);
  };
  const later = () => { clearHash(); setH(null); };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("handover_welcome_title")} className="fixed inset-0 z-50 bg-paper overflow-y-auto stamps-page-in">
      <div className="min-h-full max-w-md mx-auto px-8 py-16 flex flex-col justify-center text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay">
          {t("handover_chapter").replace("{n}", String(chapterNumber() + 1))}
        </p>
        <h2 className="font-display italic text-[32px] leading-tight text-ink mt-4 [text-wrap:balance]">{t("handover_welcome_title")}</h2>
        <p className="font-sans text-[13px] text-clay mt-4 leading-relaxed">{t("handover_welcome_sub").replace("{name}", name)}</p>
        {h.note && (
          <blockquote className="mt-8 rounded-card border border-line px-6 py-6 text-left" style={{ backgroundImage: "linear-gradient(160deg, rgba(201,122,140,0.08), transparent 60%)" }}>
            <p className="font-display italic text-[19px] leading-snug text-ink">“{h.note}”</p>
            <footer className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-clay">— {name}</footer>
          </blockquote>
        )}
        {h.stamps.length > 0 && (
          <p className="mt-6 font-display italic text-[15px] text-[#8E3D52]">
            {t(h.stamps.length === 1 ? "handover_stamps_one" : "handover_stamps").replace("{n}", String(h.stamps.length))}
          </p>
        )}
        <button onClick={begin} className="mt-10 self-center rounded-full bg-ink text-cream px-7 py-3 font-sans text-[13px]">{t("handover_begin")}</button>
        <button onClick={later} className="mt-3 self-center font-sans text-[12px] text-clay py-2 px-4">{t("handover_later")}</button>
      </div>
    </div>,
    document.body
  );
}
