import { useState } from "react";
import { Eyebrow, ShareSheet } from "../components/UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { ChevronLeft } from "lucide-react";

export function AboutPassportScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const specRow = (label: string, value: string) => (
    <div className="flex justify-between py-2.5 font-sans text-[12px]">
      <span className="text-clay">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );

  const descriptiveRow = (titleKey: TranslationKey, descKey: TranslationKey) => (
    <div className="py-3">
      <p className="font-sans text-[13px] text-ink font-medium">{t(titleKey)}</p>
      <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t(descKey)}</p>
    </div>
  );

  return (
    <div className="h-full px-5 py-6 fade-up overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-clay text-xs font-sans mb-5">
        <ChevronLeft size={14} /> {t("legal_back")}
      </button>

      <Eyebrow>{t("about_passport_eyebrow")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink leading-tight mt-1">
        {t("about_passport_title")}
      </h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">{t("about_passport_p1")}</p>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">{t("about_passport_p2")}</p>
      <p className="font-sans text-[12px] text-clay leading-relaxed mt-3">{t("about_passport_p3")}</p>
      <p className="font-sans text-[12px] text-ink leading-relaxed mt-3">{t("about_passport_p4")}</p>

      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
          {t("data_sources_title")}
        </p>
        <div className="divide-y divide-line border-y border-line">
          {specRow(t("data_source_brand_label"), t("data_source_verified_value"))}
          {specRow(t("data_source_manufacturing_label"), t("data_source_verified_value"))}
          {specRow(t("data_source_owner_label"), `✓ ${t("data_source_active_value")}`)}
          {specRow(t("data_source_updated_label"), t("about_passport_last_updated_value"))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
          {t("data_confidence_title")}
        </p>
        <div className="divide-y divide-line border-y border-line">
          {descriptiveRow("confidence_verified_title", "confidence_verified_desc")}
          {descriptiveRow("confidence_estimated_title", "confidence_estimated_desc")}
          {descriptiveRow("confidence_owner_title", "confidence_owner_desc")}
          {descriptiveRow("confidence_illustrative_title", "confidence_illustrative_desc")}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
          {t("passport_sharing_title")}
        </p>
        <div className="divide-y divide-line border-y border-line">
          {descriptiveRow("sharing_pdf_title", "sharing_pdf_desc")}
          {descriptiveRow("sharing_qr_title", "sharing_qr_desc")}
          {descriptiveRow("sharing_link_title", "sharing_link_desc")}
        </div>
        <button
          onClick={() => setShareSheetOpen(true)}
          className="w-full mt-4 bg-ink text-cream font-sans text-[12px] tracking-wide py-2.5 rounded-full"
        >
          {t("share_sheet_title")}
        </button>
      </div>

      <div className="border-t border-line mt-8 pt-6 pb-2">
        <p className="font-display italic text-[14px] text-clay text-center">
          {t("about_passport_closing")}
        </p>
      </div>
      <ShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />
    </div>
  );
}
