import { useState } from "react";
import { Eyebrow, Disclaimer, EmptyState, TodaysEdit, AskAnythingBar } from "../components/UI";
import { loadWardrobe, saveWardrobe, type WardrobeItem, logWardrobeEvent, compressImage } from "../lib/persistence";
import { useLanguage } from "../lib/i18n";
import { ChevronLeft, Shirt, Search, CalendarDays, Camera } from "lucide-react";


/* 12: MY WARDROBE */
export function MyWardrobe() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<WardrobeItem[]>(() => loadWardrobe());
  const [logging, setLogging] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      // ignore, photo is optional, don't block the rest of the form
    }
  };

  const submitMemory = () => {
    if (!name.trim()) return;
    const newItem: WardrobeItem = {
      name: name.trim(),
      tag: null,
      worn: "1×",
      note: note.trim() || "Just now",
      loggedAt: new Date().toISOString().slice(0, 10),
      ...(photo ? { photo } : {}),
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveWardrobe(updated);
    logWardrobeEvent(newItem);
    setName("");
    setNote("");
    setPhoto(null);
    setLogging(false);
  };

  const deleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    saveWardrobe(updated);
  };

  const toggleResold = (index: number) => {
    const updated = items.map((it, i) => (i === index ? { ...it, resold: !it.resold } : it));
    setItems(updated);
    saveWardrobe(updated);
  };

  const [savedFlash, setSavedFlash] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const flashSaved = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  // A single generic updater used by every editable field in the detail
  // view, autosaves immediately and briefly shows "Saved" (matching the
  // rest of the app's calm fade language, not a jarring toast).
  const updateItemField = (index: number, field: keyof WardrobeItem, value: string) => {
    const updated = items.map((it, i) => (i === index ? { ...it, [field]: value } : it));
    setItems(updated);
    saveWardrobe(updated);
    flashSaved();
  };

  const handleDetailPhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setPhotoUploading(true);
    try {
      const compressed = await compressImage(file);
      const updated = items.map((it, i) => (i === index ? { ...it, photo: compressed } : it));
      setItems(updated);
      saveWardrobe(updated);
      flashSaved();
    } catch {
      // ignore, photo upload failing shouldn't block anything else
    } finally {
      setPhotoUploading(false);
    }
  };

  const removeDetailPhoto = (index: number) => {
    const updated = items.map((it, i) => (i === index ? { ...it, photo: undefined } : it));
    setItems(updated);
    saveWardrobe(updated);
    flashSaved();
  };

  const brandCount = new Set(items.map((it) => it.brand || "Unlabeled")).size;
  const resoldCount = items.filter((it) => it.resold).length;

  const filtered = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => {
      const matchesSearch =
        !search.trim() ||
        (it.nameKey ? t(it.nameKey) : it.name).toLowerCase().includes(search.toLowerCase()) ||
        it.note.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || it.loggedAt === dateFilter;
      return matchesSearch && matchesDate;
    });

  const hasActiveFilters = search.trim() !== "" || dateFilter !== "";

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Shirt}
        eyebrow={t("my_wardrobe")}
        title={t("wardrobe_empty_title")}
        subtitle={t("wardrobe_empty_subtitle")}
        actionLabel={t("scan_a_tag")}
        actionHref="?mode=tag"
      />
    );
  }

  if (selectedIndex !== null && items[selectedIndex]) {
    const it = items[selectedIndex];
    const idx = selectedIndex;
    return (
      <div
        key={idx}
        className="h-full px-5 py-6 fade-up overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="flex items-center gap-1 text-clay text-xs font-sans"
          >
            <ChevronLeft size={14} /> {t("my_wardrobe")}
          </button>
          {savedFlash && (
            <p className="font-sans text-[10px] text-sage fade-up">{t("saved_confirmation")}</p>
          )}
        </div>

        {/* Interactive photo, tap the empty state to upload, tap an
            existing photo to replace it, small × to remove it. */}
        <div className="relative mb-4">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/heic,image/*"
              className="hidden"
              onChange={(e) => handleDetailPhotoChange(idx, e)}
            />
            {photoUploading ? (
              <div className="w-full aspect-square rounded-card bg-blush-pale/50 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-blush-deep/40 border-t-blush-deep rounded-full animate-spin" />
                <p className="font-sans text-[11px] text-clay">{t("uploading_label")}</p>
              </div>
            ) : it.photo ? (
              <img
                src={it.photo}
                alt={it.name}
                className="w-full aspect-square rounded-card object-cover border border-line"
              />
            ) : (
              <div className="w-full aspect-square rounded-card bg-blush-pale/50 flex flex-col items-center justify-center gap-2">
                <Camera size={32} className="text-[#9E4F63]/40" />
                <p className="font-sans text-[11px] text-clay">{t("upload_photo_label")}</p>
              </div>
            )}
          </label>
          {it.photo && !photoUploading && (
            <button
              onClick={() => removeDetailPhoto(idx)}
              aria-label={t("remove_photo_label")}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center text-sm"
            >
              ×
            </button>
          )}
        </div>

        {/* Editable Title */}
        <input
          defaultValue={it.nameKey ? t(it.nameKey) : it.name}
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (!value) return;
            const updated = items.map((item, i) =>
              i === idx ? { ...item, name: value, nameKey: undefined } : item
            );
            setItems(updated);
            saveWardrobe(updated);
          }}
          className="font-display italic text-2xl text-ink leading-tight w-full bg-transparent focus:outline-none focus:border-b focus:border-blush"
        />

        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
          {it.tag && (
            <span className="text-[10px] text-sage border border-sage/40 rounded-full px-2 py-1">
              {it.tag}
            </span>
          )}
          <button
            onClick={() => toggleResold(idx)}
            className={`text-[10px] rounded-full px-2 py-1 border transition-colors ${
              it.resold
                ? "text-[#9E4F63] border-blush-deep bg-blush-pale/60"
                : "text-clay border-line"
            }`}
          >
            {it.resold ? t("resold_badge") : t("mark_resold")}
          </button>
        </div>

        <div className="divide-y divide-line border-y border-line font-sans text-[12px]">
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("brand_label")}</span>
            <span className="text-ink font-medium">{it.brand || "-"}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("worn_label")}</span>
            <span className="text-ink font-medium">{it.worn}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-clay">{t("logged_label")}</span>
            <span className="text-ink font-medium">
              {it.loggedAt
                ? new Date(it.loggedAt).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })
                : "-"}
            </span>
          </div>
        </div>

        {/* Editable Description */}
        <div className="mt-4">
          <p className="text-[10px] font-sans font-semibold text-[#9E4F63] uppercase tracking-wide mb-1">
            {t("description_field_label")}
          </p>
          <textarea
            defaultValue={it.noteKey ? t(it.noteKey) : it.note}
            onBlur={(e) => {
              const value = e.target.value.trim();
              const updated = items.map((item, i) =>
                i === idx ? { ...item, note: value, noteKey: undefined } : item
              );
              setItems(updated);
              saveWardrobe(updated);
              flashSaved();
            }}
            rows={2}
            className="font-display italic text-[15px] text-ink leading-relaxed w-full bg-transparent resize-none focus:outline-none border border-transparent focus:border-line rounded-lg -mx-1 px-1"
          />
        </div>

        {/* Optional fields, Occasion, Season, Favourite Outfit Notes */}
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[9px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
              {t("occasion_field_label")}
            </p>
            <input
              defaultValue={it.occasion || ""}
              onBlur={(e) => updateItemField(idx, "occasion", e.target.value.trim())}
              placeholder={t("occasion_placeholder")}
              className="font-sans text-[12px] text-ink w-full bg-transparent focus:outline-none border-b border-line focus:border-blush py-1"
            />
          </div>
          <div>
            <p className="text-[9px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
              {t("season_field_label")}
            </p>
            <input
              defaultValue={it.season || ""}
              onBlur={(e) => updateItemField(idx, "season", e.target.value.trim())}
              placeholder={t("season_placeholder")}
              className="font-sans text-[12px] text-ink w-full bg-transparent focus:outline-none border-b border-line focus:border-blush py-1"
            />
          </div>
          <div>
            <p className="text-[9px] font-sans font-semibold text-clay uppercase tracking-wide mb-1">
              {t("favorite_notes_field_label")}
            </p>
            <textarea
              defaultValue={it.favoriteNotes || ""}
              onBlur={(e) => updateItemField(idx, "favoriteNotes", e.target.value.trim())}
              placeholder={t("favorite_notes_placeholder")}
              rows={2}
              className="font-sans text-[12px] text-ink w-full bg-transparent resize-none focus:outline-none border border-transparent focus:border-line rounded-lg -mx-1 px-1"
            />
          </div>
        </div>

        <p className="font-sans text-[9px] text-clay leading-relaxed mt-4">
          {t("save_disclaimer")}
        </p>

        <button
          onClick={() => { deleteItem(idx); setSelectedIndex(null); }}
          className="w-full mt-6 font-sans text-[12px] text-[#9E4F63] border border-line rounded-full py-2.5"
        >
          {t("remove_from_wardrobe")}
        </button>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="h-full px-5 py-6 fade-up">
      <AskAnythingBar wardrobe={items} />
      <TodaysEdit wardrobe={items} />
      <Eyebrow>{t("my_wardrobe")}</Eyebrow>
      <h2 className="font-display italic text-xl text-ink mt-1 mb-3">
        {items.length} {t("pieces")} · {brandCount} {t("brands")} · {resoldCount} {t("resold")}
      </h2>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[[String(items.length), t("items_label")], [String(brandCount), t("brands")], [String(resoldCount), t("resold")]].map(([v, l]) => (
          <div key={l} className="bg-blush-pale/60 rounded-lg py-2.5 text-center">
            <p className="font-display italic text-lg text-[#9E4F63]">{v}</p>
            <p className="text-[9px] font-sans text-clay uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full border border-line rounded-full pl-8 pr-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
        </div>
        <label className="relative flex items-center justify-center w-9 h-9 border border-line rounded-full shrink-0 cursor-pointer">
          <CalendarDays size={14} className={dateFilter ? "text-[#9E4F63]" : "text-clay"} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Filter by date logged"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-2 -mt-2">
          <p className="font-sans text-[10px] text-clay">
            {filtered.length} {t("shown_of")} {items.length} {t("shown_label")}
          </p>
          <button
            onClick={() => { setSearch(""); setDateFilter(""); }}
            className="font-sans text-[10px] text-[#9E4F63] underline underline-offset-2"
          >
            {t("clear_filters")}
          </button>
        </div>
      )}

      <div className="divide-y divide-line border-y border-line">
        {filtered.length === 0 ? (
          <p className="py-6 text-center font-sans text-[12px] text-clay">
            {t("no_entries_match")}
          </p>
        ) : (
          filtered.map(({ it, i }) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
              className="py-3 flex items-start gap-3 group cursor-pointer"
            >
              {it.photo ? (
                <img
                  src={it.photo}
                  alt={it.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-line"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-blush-pale/50 flex items-center justify-center shrink-0">
                  <Camera size={16} className="text-[#9E4F63]/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[13px] font-medium text-ink flex items-center gap-1.5 flex-wrap">
                  {it.nameKey ? t(it.nameKey) : it.name}
                  {it.tag && (
                    <span className="text-[9px] text-sage border border-sage/40 rounded-full px-1.5 py-0.5">
                      {it.tag}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleResold(i); }}
                    className={`text-[9px] rounded-full px-1.5 py-0.5 border transition-colors ${
                      it.resold
                        ? "text-[#9E4F63] border-blush-deep bg-blush-pale/60"
                        : "text-clay border-line"
                    }`}
                  >
                    {it.resold ? t("resold_badge") : t("mark_resold")}
                  </button>
                </p>
                <p className="font-sans text-[11px] text-clay mt-0.5">
                  {t("worn_label")} {it.worn} · {it.noteKey ? t(it.noteKey) : it.note}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteItem(i); }}
                aria-label={`Remove ${it.name}`}
                className="text-clay hover:text-[#9E4F63] font-sans text-[11px] shrink-0 pt-0.5"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {logging ? (
        <div className="mt-4 border border-line rounded-card px-4 py-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            <label className="w-14 h-14 rounded-lg border border-dashed border-blush flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
              {photo ? (
                <img src={photo} alt="Selected" className="w-full h-full object-cover" />
              ) : (
                <Camera size={18} className="text-[#9E4F63]/60" />
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
            <p className="font-sans text-[10px] text-clay flex-1">
              {photo ? t("photo_added_hint") : t("add_photo_hint")}
            </p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("what_is_it")}
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("memory_placeholder")}
            className="w-full border border-line rounded-lg px-3 py-2 font-sans text-[12px] text-ink focus:outline-none focus:border-blush"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={submitMemory}
              className="flex-1 bg-ink text-cream font-sans text-[11px] tracking-wide py-2 rounded-full"
            >
              {t("save_memory")}
            </button>
            <button
              onClick={() => { setLogging(false); setName(""); setNote(""); setPhoto(null); }}
              className="px-4 font-sans text-[11px] text-clay"
            >
              {t("cancel")}
            </button>
          </div>
          <p className="font-sans text-[9px] text-clay leading-relaxed">
            {t("save_disclaimer")}
          </p>
        </div>
      ) : (
        <button
          onClick={() => setLogging(true)}
          className="w-full mt-4 font-sans text-[12px] text-[#9E4F63] border border-dashed border-blush rounded-full py-2.5"
        >
          {t("log_a_memory")}
        </button>
      )}
      <p className="font-display italic text-[13px] text-clay text-center mt-6">
        With care,
        <br />Elizabeth Xu
      </p>
      <Disclaimer />
    </div>
  );
}

/* PRIVACY POLICY, reached only via the footer link, keeps the same
   application shell (progress bar, nav arrows, margins, typography); this
   just swaps what renders in the content area. */
