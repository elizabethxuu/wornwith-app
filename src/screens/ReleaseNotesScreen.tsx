import { Eyebrow } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";

export function ReleaseNotesScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();

  const group = (titleKey: TranslationKey, itemKeys: TranslationKey[]) => (
    <div className="mt-5">
      <p className="font-display italic text-[14px] text-ink mb-1.5">{t(titleKey)}</p>
      <ul className="space-y-1">
        {itemKeys.map((k) => (
          <li key={k} className="font-sans text-[11px] text-ink/80 flex items-start gap-1.5">
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

      <Eyebrow>{t("release_notes_eyebrow")}</Eyebrow>
      <h1 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("rn12_title")}
      </h1>
      <p className="font-sans text-[12px] text-clay mt-1" style={{ letterSpacing: "0.02em" }}>
        {t("rn12_date")}
      </p>
      <p className="font-sans text-[11px] mt-0.5 text-clay">
        {t("rn12_version")}
      </p>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("rn12_subtitle")}
      </p>

      {group("rn12_claims_title", ["rn12_claims_1", "rn12_claims_2"])}
      {group("rn12_reliability_title", ["rn12_reliability_1", "rn12_reliability_2", "rn12_reliability_3"])}
      {group("rn12_sharing_title", ["rn12_sharing_1"])}
      {group("rn12_access_title", ["rn12_access_1", "rn12_access_2"])}

      <div className="border-t border-line mt-8" />
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-6">
        {t("rn11_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay mt-1" style={{ letterSpacing: "0.02em" }}>
        {t("rn11_date")}
      </p>
      <p className="font-sans text-[11px] mt-0.5 text-clay">
        {t("rn11_version")}
      </p>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("rn11_subtitle")}
      </p>

      {group("rn11_language_title", ["rn11_language_1", "rn11_language_2", "rn11_language_3"])}
      {group("rn11_brand_title", ["rn11_brand_1", "rn11_brand_2"])}
      {group("rn11_passport_title", ["rn11_passport_1", "rn11_passport_2", "rn11_passport_3"])}

      <div className="border-t border-line mt-8" />
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-6">
        {t("release_notes_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay mt-1" style={{ letterSpacing: "0.02em" }}>
        {t("release_notes_date")}
      </p>
      <p className="font-sans text-[11px] mt-0.5 text-clay">
        {t("release_notes_version")}
      </p>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">
        {t("release_notes_subtitle")}
      </p>

      <div className="border-t border-line mt-6" />
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mt-6 mb-1">
        {t("whats_new_title")}
      </p>

      {group("rn_editorial_title", ["rn_editorial_1", "rn_editorial_2", "rn_editorial_3"])}
      {group("rn_wardrobe_title", ["rn_wardrobe_1", "rn_wardrobe_2", "rn_wardrobe_3", "rn_wardrobe_4"])}
      {group("rn_care_title", ["rn_care_1", "rn_care_2", "rn_care_3", "rn_care_4"])}
      {group("rn_product_title", ["rn_product_1", "rn_product_2", "rn_product_3", "rn_product_4"])}
      {group("rn_general_title", [
        "rn_general_1",
        "rn_general_2",
        "rn_general_3",
        "rn_general_4",
        "rn_general_5",
        "rn_general_6",
        "rn_general_7",
      ])}

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("release_notes_closing")}
        </p>
      </div>
    </div>
  );
}

/* CLOSING, now a genuine indexed page (the 11th), reached only via the
   right nav arrow on the last real screen, not a generic tap-anywhere
   overlay. Same shell, same chrome, same transition as every other
   screen, no special fade-to-white, no modal. */
