import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Nfc, X } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { GARMENT } from "../lib/garment";
import { PASSPORT_ID } from "../lib/passportRecord";
import { nfcAvailable, scanCoatTag, type ScanResult } from "../lib/nfc";
import { haptic } from "../lib/touches";

// Only inside the iPhone app: scan the tag sewn into the coat, from the
// menu, and confirm it is this coat's passport.
export function NativeScanButton({ onOpenPassport }: { onOpenPassport: () => void }) {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    let live = true;
    nfcAvailable().then((a) => { if (live) setAvailable(a); });
    return () => { live = false; };
  }, []);

  if (!available) return null;

  const scan = async () => {
    const r = await scanCoatTag(GARMENT.dppId, t("nfc_prompt"));
    if (r.state === "cancelled") return;
    haptic(r.state === "match" ? 18 : 10);
    setResult(r);
  };

  const close = () => setResult(null);
  const open = () => { close(); onOpenPassport(); };

  return (
    <>
      <button onClick={scan} aria-label={t("nfc_scan")} title={t("nfc_scan")} className="menu-icon-btn">
        <Nfc size={18} strokeWidth={1.4} />
      </button>
      {result && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={t("nfc_scan")}>
          <button className="absolute inset-0 bg-ink/30" aria-label={t("close_label")} onClick={close} />
          <div className="relative w-full max-w-md bg-paper rounded-t-[28px] px-6 pt-6 fade-up" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}>
            <button onClick={close} aria-label={t("close_label")} className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center text-clay"><X size={18} /></button>
            {result.state === "match" ? (
              <>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8E3D52]">{t("nfc_match_eyebrow")}</p>
                <h2 className="font-display italic text-[28px] text-ink mt-2 leading-tight">{t("nfc_match_title")}</h2>
                <p className="font-sans text-[12px] text-clay mt-2">{PASSPORT_ID} · {t("nfc_match_sub")}</p>
                <button onClick={open} className="mt-6 w-full rounded-full bg-ink text-cream py-3 font-sans text-[13px]">{t("nfc_open")}</button>
              </>
            ) : (
              <>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-clay">{t("nfc_scan")}</p>
                <h2 className="font-display italic text-[24px] text-ink mt-2 leading-tight">
                  {t(result.state === "other" ? "nfc_other" : result.state === "no-passport" ? "nfc_none" : result.state === "unavailable" ? "nfc_unavailable" : "nfc_error")}
                </h2>
                <button onClick={() => { close(); void scan(); }} className="mt-6 w-full rounded-full border border-line py-3 font-sans text-[13px] text-ink">{t("nfc_try_again")}</button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
