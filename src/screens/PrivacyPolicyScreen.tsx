import { Eyebrow } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";

export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();

  const section = (titleKey: TranslationKey, itemKeys: TranslationKey[]) => (
    <div className="mt-6">
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-2">
        {t(titleKey)}
      </p>
      <ul className="space-y-1.5">
        {itemKeys.map((k) => (
          <li key={k} className="font-sans text-[12px] text-ink/80 flex items-start gap-1.5">
            <span className="text-clay shrink-0">·</span>
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("privacy_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("privacy_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("privacy_subtitle")}
      </p>

      <div className="border-t border-line mt-6" />
      {section("privacy_section1_title", [
        "privacy_item_garment_details",
        "privacy_item_photos",
        "privacy_item_care_notes",
        "privacy_item_ownership_history",
        "privacy_item_wear_history",
        "privacy_item_personal_notes",
      ])}

      <div className="border-t border-line mt-6" />
      {section("privacy_section2_title", [
        "privacy_use_personalize",
        "privacy_use_ownership",
        "privacy_use_longevity",
        "privacy_use_standards",
      ])}

      <div className="border-t border-line mt-6" />
      {section("privacy_section3_title", [
        "privacy_never_sold",
        "privacy_ownership_remains",
        "privacy_photos_private",
        "privacy_export_delete",
      ])}

      <div className="border-t border-line mt-6" />
      {section("privacy_section4_title", [
        "privacy_encrypted_storage",
        "privacy_secure_auth",
        "privacy_protected_backups",
      ])}

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("privacy_closing_quote")}
        </p>
      </div>
    </div>
  );
}
