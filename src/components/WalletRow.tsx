import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { apiUrl } from "../lib/apiBase";
import { loadOwnershipRecord } from "../lib/persistence";

// This row's own words, loaded with it only when the share sheet opens.
const WA = {
  wallet_title: { en: "Apple Wallet", fr: "Apple Wallet", pt: "Apple Wallet" },
  wallet_desc: { en: "Keep the passport in Wallet, with the next care date on it.", fr: "Gardez le passeport dans Wallet, avec la prochaine date d'entretien.", pt: "Guarde o passaporte na Wallet, com a próxima data de cuidado." },
  wallet_add: { en: "Add to Apple Wallet", fr: "Ajouter à Apple Wallet", pt: "Adicionar à Apple Wallet" },
} as const;

// Apple Wallet only works on Apple devices.
const onApple = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

// A row in the share sheet that adds the coat's passport to Apple Wallet.
// It only appears once the pass can really be signed (the Apple certificates
// are set in Vercel), so nobody ever taps a button that can't work.
export default function WalletRow() {
  const { lang } = useLanguage();
  const t = (k: keyof typeof WA) => WA[k][lang];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!onApple()) return;
    let live = true;
    fetch(apiUrl("/api/pass?check=1"))
      .then((r) => (r.ok ? r.json() : { ready: false }))
      .then((j: { ready?: boolean }) => { if (live) setReady(Boolean(j.ready)); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  if (!ready) return null;

  const record = loadOwnershipRecord();
  const params = new URLSearchParams({ lang });
  const worn = String(record.wearCount || "").replace(/[^0-9]/g, "");
  if (worn) params.set("worn", worn);
  if (record.owner?.trim()) params.set("owner", record.owner.trim().slice(0, 40));
  const href = apiUrl(`/api/pass?${params.toString()}`);

  return (
    <div className="py-3.5">
      <p className="font-sans text-[13px] text-ink font-medium">{t("wallet_title")}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("wallet_desc")}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2.5 font-sans text-[12px] font-medium"
      >
        <Wallet size={16} strokeWidth={1.6} aria-hidden="true" />
        {t("wallet_add")}
      </a>
    </div>
  );
}
