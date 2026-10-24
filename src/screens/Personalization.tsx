import { useState, useEffect } from "react";
import { openYourStampsPage } from "../lib/stamps";
import { Eyebrow, ExpandableCard, ArchiveTransition, ArchiveTimeline, type ArchiveEntry } from "../components/UI";
import { ChapterColorProvider, ARCHIVE_ACCENT_COLOR } from "../lib/chapterColor";
import { generateAI } from "../lib/aiService";
import { loadMoment, saveMoment, loadMoments, addMoment, updateMomentSummary, type SavedMoment, loadOwnershipRecord, saveOwnershipRecord, type OwnershipRecord } from "../lib/persistence";
import { GARMENT, getEstimatedYearsRemaining } from "../lib/garment";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { Pencil } from "lucide-react";


/* 11: PERSONALIZATION */
export function Personalization() {
  const { t } = useLanguage();
  const [text, setText] = useState(() => loadMoment());
  const [moments, setMoments] = useState<SavedMoment[]>(() => loadMoments());
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  // Returning visitors who already have history land straight in the
  // archive; first-time visitors start on the compose view.
  const [view, setView] = useState<"compose" | "transitioning" | "archive">(
    () => (loadMoments().length > 0 ? "archive" : "compose")
  );
  const [curatorsNotes, setCuratorsNotes] = useState<string | null>(null);
  const [ownershipRecord, setOwnershipRecord] = useState<OwnershipRecord>(() => loadOwnershipRecord());
  const [ownershipSaved, setOwnershipSaved] = useState(false);
  // Which single field (if any) is currently expanded into an editable
  // input, tapping the pencil on a row opens just that one, tapping
  // away or blurring closes it back to read-only text.
  const [editingField, setEditingField] = useState<keyof OwnershipRecord | null>(null);

  const updateOwnershipField = (field: keyof OwnershipRecord, value: string) => {
    const updated = { ...ownershipRecord, [field]: value };
    setOwnershipRecord(updated);
    saveOwnershipRecord(updated);
    setOwnershipSaved(true);
    setTimeout(() => setOwnershipSaved(false), 1600);
  };

  // Every field, pre-filled or blank, renders identically: a label, a
  // value or muted placeholder, and a pencil that expands just that row
  // into an editable input. autoValue is only passed for fields that can
  // genuinely be derived from real passport data (Purchase Date,
  // Condition, Wear Count); Owner has no real value to pull from since
  // there's no account system here, so it stays genuinely blank until
  // someone fills it in themselves.
  const renderOwnershipField = (
    field: keyof OwnershipRecord,
    labelKey: TranslationKey,
    autoValue?: string,
    required?: boolean
  ) => {
    const isEditing = editingField === field;
    const displayValue = ownershipRecord[field] || autoValue || "";
    return (
      <div key={field}>
        <p className="text-[9px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
          {t(labelKey)}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
        {isEditing ? (
          <input
            autoFocus
            defaultValue={ownershipRecord[field] || ""}
            onBlur={(e) => {
              updateOwnershipField(field, e.target.value.trim());
              setEditingField(null);
            }}
            className="font-sans text-[12px] text-ink w-full bg-transparent focus:outline-none border-b border-blush py-1"
          />
        ) : (
          <div className="flex items-center border-b border-line py-1">
            <p className={`font-sans text-[12px] ${displayValue ? "text-ink" : "text-clay italic"}`}>
              {displayValue || t("field_not_added")}
            </p>
            <button
              onClick={() => setEditingField(field)}
              aria-label={t(labelKey)}
              className="text-clay shrink-0 ml-1.5"
            >
              <Pencil size={12} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Curator's Notes: real generation, but cached for the day so opening
  // this screen repeatedly doesn't re-call the API every time. Falls back
  // silently to the static editorial copy if generation fails, this
  // section is never blank and never stuck loading.
  useEffect(() => {
    if (view !== "archive") return;
    const cacheKey = "wornwith:curatorsNotes";
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.date === todayKey && cached.text) {
        setCuratorsNotes(cached.text);
        return;
      }
    } catch {
      // ignore malformed cache, just regenerate
    }
    generateAI("curatorsNotes", {
      garmentName: GARMENT.name,
      ownedSince: "1 April 2026",
      timesWorn: "18",
      condition: "excellent",
      yearsRemaining: getEstimatedYearsRemaining(),
    }).then((result) => {
      if (result.success && result.content) {
        setCuratorsNotes(result.content);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ date: todayKey, text: result.content }));
        } catch {
          // storage full or unavailable, not worth failing over
        }
      }
      // On failure, curatorsNotes stays null and the static fallback copy
      // renders instead, no error state needed for this one, since the
      // static copy is a genuinely good fallback, not a degraded one.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const generateReflection = async (savedAt: string, momentText: string) => {
    setGenerating((g) => ({ ...g, [savedAt]: true }));
    setFailed((f) => ({ ...f, [savedAt]: false }));
    const result = await generateAI("reflection", { momentText });
    if (result.success && result.content) {
      setMoments(updateMomentSummary(savedAt, result.content));
    } else {
      setFailed((f) => ({ ...f, [savedAt]: true }));
    }
    setGenerating((g) => ({ ...g, [savedAt]: false }));
  };

  const handleSave = () => {
    if (!text.trim()) return;
    saveMoment(text);
    const updated = addMoment(text);
    setMoments(updated);
    const newMoment = updated[updated.length - 1];
    generateReflection(newMoment.savedAt, newMoment.text);
    setText("");
    saveMoment("");
    setView("transitioning");
  };

  const latestMoment = moments.length > 0 ? moments[moments.length - 1] : null;

  const archiveEntries: ArchiveEntry[] = [
    { year: "2026", category: t("archive_cat_acquisition"), title: t("archive_title_acquisition"), description: t("archive_desc_acquisition") },
    { year: "2026", category: t("archive_cat_journey"), title: t("archive_title_journey"), description: t("archive_desc_journey") },
    { year: "2027", category: t("archive_cat_maintenance"), title: t("archive_title_maintenance"), description: t("archive_desc_maintenance") },
    { year: "2027", category: t("archive_cat_milestone"), title: t("archive_title_milestone"), description: t("archive_desc_milestone") },
    { year: "2028", category: t("archive_cat_restoration"), title: t("archive_title_restoration"), description: t("archive_desc_restoration") },
    { year: "2029", category: t("archive_cat_transfer"), title: t("archive_title_transfer"), description: t("archive_desc_transfer") },
  ];

  if (view === "transitioning") {
    return (
      <ArchiveTransition
        phrases={[
          t("transition_saving"),
          t("transition_provenance"),
          t("transition_reflection"),
          t("transition_assessing"),
          t("transition_complete"),
        ]}
        onDone={() => setView("archive")}
      />
    );
  }

  if (view === "archive") {
    return (
      <div className="h-full px-5 py-6 fade-up overflow-y-auto">
        {/* AI Reflection, featured, at the top */}
        {latestMoment && (
          <div className="mb-8">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-2">
              ◆ {t("ai_reflection_title")}
            </p>
            {latestMoment.summary ? (
              <>
              <p className="font-display italic text-[17px] text-ink leading-relaxed">
                "{latestMoment.summary}"
              </p>
              <p className="font-sans text-[10px] text-clay mt-2">{t("ai_reflection_label")}</p>
              </>
            ) : generating[latestMoment.savedAt] ? (
              <p className="font-sans text-[11px] text-clay italic">{t("generating_reflection")}</p>
            ) : failed[latestMoment.savedAt] ? (
              <div>
                <button
                  onClick={() => generateReflection(latestMoment.savedAt, latestMoment.text)}
                  className="font-sans text-[11px] text-[#9E4F63] underline underline-offset-2"
                >
                  {t("reflection_failed")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => generateReflection(latestMoment.savedAt, latestMoment.text)}
                className="font-sans text-[11px] text-clay underline underline-offset-2"
              >
                {t("generate_reflection")}
              </button>
            )}
          </div>
        )}

        {/* From the Archives, its own Deep Plum accent, distinct from the
            Dusty Burgundy used for the rest of the Ownership screen */}
        <ChapterColorProvider color={ARCHIVE_ACCENT_COLOR}>
          <div className="mb-8 fade-up" style={{ animationDelay: "150ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold transition-colors duration-500" style={{ color: ARCHIVE_ACCENT_COLOR }}>
              {t("from_the_archives_title")}
            </p>
            <p className="font-sans text-[11px] text-clay mt-1 mb-3 leading-relaxed">
              {t("from_the_archives_subtitle")}
            </p>
            <p className="font-sans text-[10px] text-clay italic mb-5 leading-relaxed">
              {t("archive_framing_line")}
            </p>
            <ArchiveTimeline entries={archiveEntries} showProjectedTag />
          </div>
        </ChapterColorProvider>

        {/* Curator's Notes, deliberately no card, generous white space.
            Real AI generation, cached once per day so it doesn't
            regenerate on every visit, with a graceful fallback to static
            editorial copy if generation fails or hasn't loaded yet, this
            section should never be blank or stuck loading. */}
        <div className="mb-8 py-2 fade-up" style={{ animationDelay: "650ms" }}>
          <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-3">
            {t("curators_notes_title")}
          </p>
          <p className="font-display italic text-[15px] text-ink leading-loose">
            {curatorsNotes || t("curators_notes_body")}
          </p>
        </div>

        {/* Ownership Summary, simplified */}
        <div className="mb-6">
          <Eyebrow>{t("ownership_summary_title")}</Eyebrow>
          <div className="mt-2 space-y-1.5 font-sans text-[12px]">
            <div className="flex justify-between"><span className="text-clay">{t("owned_since")}</span><span className="text-ink">{t("owned_since_date")}</span></div>
            <div className="flex justify-between"><span className="text-clay">{t("recorded_wears")}</span><span className="text-ink">18</span></div>
            <div className="flex justify-between"><span className="text-clay">{t("condition")}</span><span className="text-sage">{t("excellent")}</span></div>
            <div className="flex justify-between"><span className="text-clay">{t("est_lifespan")}</span><span className="text-ink">{getEstimatedYearsRemaining()} {t("years_word")}</span></div>
            <div className="flex justify-between"><span className="text-clay">{t("environmental_ranking")}</span><span className="text-ink">Top 10%</span></div>
            <div className="flex justify-between"><span className="text-clay">{t("archive_entries_count")}</span><span className="text-ink">{archiveEntries.length}</span></div>
          </div>
        </div>

        {/* Ownership Record, progressive disclosure. Owner, Purchase
            Date, Condition and Wear Count arrive pre-filled from real
            passport data (the same source of truth the Product page
            reads), shown read-only with a pencil to edit inline, one
            field at a time, not the whole form at once. Purchase Location
            /Price/Retailer sit inside a collapsed accordion since they're
            one-time, optional, and blank by default. Repair History,
            Favourite Memories, Travel History and Notes are deliberately
            NOT here, those build up through "+ Save another moment"
            instead of sitting as empty boxes on first load. */}
        <div className="mb-6">
          <Eyebrow>{t("ownership_record_title")}</Eyebrow>
          <p className="font-sans text-[10px] text-clay leading-relaxed mt-1 mb-3">
            {t("ownership_record_subtitle")}
          </p>

          <div className="space-y-3">
            {renderOwnershipField("owner", "field_owner", undefined, true)}
            {renderOwnershipField("purchaseDate", "field_purchase_date", t("owned_since_date"))}
            {renderOwnershipField("condition", "field_condition", t("excellent"))}
            {renderOwnershipField("wearCount", "field_wear_count", GARMENT.timesWorn)}
          </div>

          <ExpandableCard title={t("purchase_details_title")}>
            <div className="space-y-3">
              {renderOwnershipField("purchaseLocation", "field_purchase_location")}
              {renderOwnershipField("purchasePrice", "field_purchase_price")}
              {renderOwnershipField("originalRetailer", "field_original_retailer")}
            </div>
          </ExpandableCard>

          <p className="font-sans text-[9px] text-clay leading-relaxed mt-3 italic">
            {t("ownership_narrative_hint")}
          </p>

          {ownershipSaved && (
            <p className="font-sans text-[10px] text-sage fade-up mt-2">{t("saved_confirmation")}</p>
          )}
          <p className="font-sans text-[9px] text-clay leading-relaxed mt-3">
            {t("save_disclaimer")}
          </p>
        </div>

        <button
          onClick={() => setView("compose")}
          className="font-sans text-[11px] text-[#9E4F63] underline underline-offset-2"
        >
          {t("save_another_moment")}
        </button>

        <p className="font-display italic text-[12px] text-clay text-center mt-8">
          {t("closing_line")}
        </p>
        <YourStampsMark />
      </div>
    );
  }

  return (
    <div className="h-full px-5 py-6 fade-up flex flex-col">
      <Eyebrow>{t("make_it_yours")}</Eyebrow>
      <h2 className="font-display italic text-2xl text-ink mt-1 mb-4 leading-snug">
        {t("when_wear")}
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={t("moment_placeholder")}
        style={{ minHeight: "88px", lineHeight: "1.5" }}
        className="w-full border border-line rounded-xl px-3.5 py-3.5 font-display italic text-[14px] text-ink resize-none focus:outline-none focus:border-blush box-border"
      />
      <button
        onClick={handleSave}
        className="mt-3 w-full bg-ink text-cream font-sans text-[12px] tracking-wide py-2.5 rounded-full transition-colors"
      >
        {t("save_moment")}
      </button>
      <p className="font-sans text-[9px] text-clay text-center leading-relaxed mt-2 px-2">
        {t("save_disclaimer")}
      </p>

      <p className="font-display italic text-[12px] text-clay text-center mt-auto pt-6">
        {t("closing_line")}
      </p>
      <YourStampsMark />
    </div>
  );
}

// A secret: a faint burgundy stamp mark under the closing line opens the
// owner's own stamp page. Same quiet mark as the one on the End screen.
function YourStampsMark() {
  const { t } = useLanguage();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); openYourStampsPage(); }}
      aria-label={t("owner_stamps_mark")}
      title={t("owner_stamps_mark")}
      className="stamp-hint self-center mx-auto mt-6 mb-2 w-11 h-11 rounded-full border-[1.5px] border-dashed border-[#8E3D52] flex items-center justify-center rotate-[10deg]"
    >
      <span className="w-7 h-7 rounded-full border border-[#8E3D52] flex items-center justify-center font-display italic text-[12px] text-[#8E3D52]">✦</span>
    </button>
  );
}
