import { useState } from "react";
import { Eyebrow } from "../components/UI";
import { useLanguage } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";

export const CONTACT_EMAIL = "hello@wornwith.care";

/* CONTACT, same editorial shell as Privacy/Terms/Accessibility. */
export function ContactScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // the address stays visible and selectable
    }
  };

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("contact_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">{t("contact_title")}</h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">{t("contact_subtitle")}</p>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">{t("contact_email_label")}</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-display italic text-[22px] text-ink underline decoration-line underline-offset-4 select-all break-all">
          {CONTACT_EMAIL}
        </a>
        <div className="flex gap-2 mt-4">
          <a href={`mailto:${CONTACT_EMAIL}`} className="rounded-full bg-ink text-cream px-5 py-2.5 font-sans text-[12px]">{t("contact_write")}</a>
          <button onClick={copy} className="rounded-full border border-line px-5 py-2.5 font-sans text-[12px] text-ink">
            {copied ? t("contact_copied") : t("contact_copy")}
          </button>
        </div>
      </div>

      <div className="border-t border-line mt-6" />
      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">{t("contact_topics_title")}</p>
        <p className="font-sans text-[12px] text-ink/80 leading-relaxed">{t("contact_topics_body")}</p>
      </div>

      <p className="font-sans text-[10px] text-clay mt-8 uppercase tracking-[0.2em]">{t("welcome_by")}</p>
    </div>
  );
}
