import { Fragment } from "react";
import { Eyebrow, ExpandableCard, StatusChip, SignedRecordLink, type ClaimStatus } from "../components/UI";
import { useLanguage } from "../lib/i18n";
import { ArrowRight, Sprout, Factory, Ship, Store } from "lucide-react";
import { SUPPLY_CHAIN, JOURNEY, ETHICAL_AUDIT, CHEMICAL_COMPLIANCE, PASSPORT_RECORD } from "../lib/passportRecord";

// The recycled share, read from the record's composition ("70% Recycled Wool").
const recycledShare = PASSPORT_RECORD.product.composition.match(/\d+%/)?.[0] ?? "";
import type { TranslationKey } from "../lib/i18n";

const STAGE_ICONS = { wool_farm: Sprout, milling: Factory, ship: Ship, retail: Store } as const;

// Record statuses to the chips the app already uses.
const CHIP: Record<string, ClaimStatus> = { pending_verification: "pending", not_available: "unavailable" };
const RESULT_KEY: Record<string, TranslationKey> = {
  passed: "passed",
  grade_a: "grade_a",
  no_test_report_on_file: "reach_info_value",
  placeholder: "economic_operator_value",
};


/* 6: SUPPLY CHAIN */
export function SupplyChain() {
  const { t } = useLanguage();
  // Stages come from the signed passport record, so the page and the
  // published fingerprint always describe the same journey.
  const chain = SUPPLY_CHAIN.map((s) => {
    const Icon = STAGE_ICONS[s.stage];
    return { icon: <Icon size={18} strokeWidth={1.25} />, label: t(s.stage), place: s.place, code: s.code };
  });
  return (
    <div className="h-full px-5 py-6 fade-up">
      <Eyebrow>{t("supply_chain")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1">{t("who_made_it")}</h2>
      <p className="text-[12px] text-clay font-sans mt-1 mb-3">{t("supply_chain_supporting_line")}</p>
      <div className="flex items-center justify-between mt-2 mb-4">
        {chain.map((c, i) => (
          <div key={c.label} className="flex items-center">
            <div
              style={{ animationDelay: `${i * 150}ms` }}
              className="pop-in text-center w-14"
            >
              <div className="w-11 h-11 mx-auto rounded-full flex items-center justify-center border border-[#8E3D52]/30 text-[#8E3D52] bg-[#FBF9F6]">
                {c.icon}
              </div>
              <p className="text-[10px] font-sans font-semibold text-ink mt-1.5">{c.label}</p>
              <p className="text-[10px] font-sans text-clay">{c.place}</p>
              <p className="text-[9px] font-sans text-clay tracking-wide">{c.code}</p>
            </div>
            {i < chain.length - 1 && (
              <ArrowRight
                size={13}
                strokeWidth={1.5}
                style={{ animationDelay: `${i * 150 + 75}ms` }}
                className="pop-in text-clay/50 shrink-0 -mt-8"
              />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[[String(JOURNEY.countries), t("countries")], [`${JOURNEY.distanceKm.toLocaleString("en-US")} km`, t("traveled")], [recycledShare, t("stat_recycled")]].map(([v, l]) => (
          <div key={l} className="border-y border-line py-3 text-center">
            <p className="font-display italic text-[22px] leading-none text-ink">{v}</p>
            <p className="text-[9px] font-sans text-clay uppercase tracking-[0.18em] mt-1.5">{l}</p>
          </div>
        ))}
      </div>
      <ExpandableCard title={t("ethical_audit")} defaultOpen footerText={`${t("audit_source_note")} ${t("audit_disclosure")}`}>
        <div className="grid grid-cols-[1fr,auto] gap-y-2 gap-x-4 font-sans text-[12px] items-center">
          {ETHICAL_AUDIT.results.map((r) => (
            <Fragment key={r.criterion}>
              <span className="text-clay">{t(r.criterion)}</span>
              <span className="text-ink flex items-center gap-2 justify-self-start">{t(RESULT_KEY[r.result])} <StatusChip status={CHIP[r.status]} /></span>
            </Fragment>
          ))}
        </div>
      </ExpandableCard>

      <ExpandableCard title={t("chemical_compliance")} defaultOpen footerText={`${t("chemical_source_note")} ${t("economic_operator_note")}`}>
        <div className="grid grid-cols-[1fr,auto] gap-y-2 gap-x-4 font-sans text-[12px] items-start">
          <span className="text-clay">{t("reach_info")}</span>
          <span className="text-ink flex flex-col items-end gap-1 text-right text-[11px]">{t(RESULT_KEY[CHEMICAL_COMPLIANCE.reach.result])} <StatusChip status={CHIP[CHEMICAL_COMPLIANCE.reach.status]} /></span>
          <span className="text-clay">{t("economic_operator")}</span>
          <span className="text-ink flex flex-col items-end gap-1 text-right text-[11px]">{t(RESULT_KEY[CHEMICAL_COMPLIANCE.economicOperator.result])} <StatusChip status={CHIP[CHEMICAL_COMPLIANCE.economicOperator.status]} /></span>
        </div>
      </ExpandableCard>

      <ExpandableCard
        title={t("manufacturing_card_title")}
        rows={[
          [t("manufacturing_mill_label"), t("manufacturing_mill_value")],
          [t("manufacturing_family_label"), t("manufacturing_family_value")],
          [t("manufacturing_since_label"), t("manufacturing_since_value")],
          [t("manufacturing_renewable_label"), t("manufacturing_renewable_value")],
        ]}
      />

      <SignedRecordLink subKey="sr_sub_materials" />
    </div>
  );
}
