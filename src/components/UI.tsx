import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Mic, Square, AudioLines, Trash2, Plus, ArrowUp, X, Camera, Shirt } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import type { WardrobeItem } from "../lib/persistence";
import { loadVoiceNote, saveVoiceNote, deleteVoiceNote, compressImage, type VoiceNote } from "../lib/persistence";
import { requestVoice, transcribeVoiceNote } from "../lib/voice";
import { duck as duckAmbient } from "../lib/ambient";
import { useChapterColor, readableOn } from "../lib/chapterColor";
import { passportUrl } from "../lib/config";
import { GARMENT } from "../lib/garment";
import { ATTESTATION, PASSPORT_ID, checkRecord, publicRecordUrl, shortHex, type RecordCheck } from "../lib/passportRecord";
import { getCurrentSeason } from "../lib/careRecommendation";
import { getTimeOfDay, selectAtmosphere, spotifySearchUrl, type Atmosphere } from "../lib/interlude";
import {
  fetchWeather,
  pickFeaturedItem,
  pickAlternatives,
  naturalName,
  daysSinceLogged,
  parseWornCount,
  getWeatherObservationKey,
  getReasoningKey,
  getNotWornPhraseKey,
  capitalizeFirst,
  type WeatherData,
} from "../lib/todaysEdit";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const color = readableOn(useChapterColor());
  return (
    <p className="text-[10px] tracking-[0.26em] uppercase font-sans font-medium transition-colors duration-500" style={{ color }}>
      {children}
    </p>
  );
}

export function Donut({
  percent,
  label,
  sublabel,
  color = "#C97A8C",
}: {
  percent: number;
  label: string;
  sublabel: string;
  color?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    // Kick off the fill on the next tick so the browser paints the 0%
    // state first, otherwise React batches straight to the final value
    // and the stroke transition never has anything to animate from.
    const t = setTimeout(() => setDisplayed(percent), 50);
    return () => clearTimeout(t);
  }, [percent]);

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (displayed / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[84px] h-[84px]">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" style={{ stroke: "rgb(var(--c-track))" }} />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 42 42)"
            style={{ transition: "stroke-dashoffset 1.1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display italic text-lg text-ink">
          {displayed}%
        </div>
      </div>
      <p className="text-[10px] font-sans font-semibold text-clay uppercase tracking-wide">{label}</p>
      <p className="text-[10px] font-sans text-clay">{sublabel}</p>
    </div>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className={`bg-paper border border-line rounded-card px-5 py-4 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}



export function Pill({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-[12px] text-clay w-24 shrink-0">{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-sans text-[12px] text-ink font-medium w-9 text-right shrink-0">{percent}%</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionHref,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 fade-up">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="w-20 h-20 rounded-full bg-blush-pale flex items-center justify-center my-4">
        <Icon size={28} className="text-[#9E4F63]" strokeWidth={1.5} />
      </div>
      <h2 className="font-display italic text-2xl text-ink mb-2 leading-tight">{title}</h2>
      <p className="font-sans text-[12px] text-clay leading-relaxed max-w-[240px]">{subtitle}</p>
      {children}
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-5 bg-ink text-cream font-sans text-[13px] font-semibold px-6 py-3 rounded-full"
        >
          {actionLabel}
        </a>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-5 bg-ink text-cream font-sans text-[13px] font-semibold px-6 py-3 rounded-full"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export type ClaimStatus = "verified" | "manufacturer" | "owner" | "estimated" | "pending" | "unavailable";

// Small, quiet label saying where a claim comes from. "verified" must only be
// used when supporting documentation has actually been checked.
export function StatusChip({ status }: { status: ClaimStatus }) {
  const { t } = useLanguage();
  const label = t(`status_${status}` as TranslationKey);
  const tone = status === "verified" ? "border-[#8E3D52] text-[#8E3D52]" : "border-line text-clay";
  return (
    <span className={`inline-block border px-1.5 py-[1px] text-[9px] uppercase tracking-[0.14em] font-sans whitespace-nowrap ${tone}`}>
      {label}
    </span>
  );
}

export function ExpandableCard({
  title,
  bodyText,
  rows = [],
  footerText,
  learnMoreHref,
  learnMoreLabel,
  onLearnMoreClick,
  defaultOpen = false,
  children,
}: {
  title: string;
  bodyText?: string;
  rows?: [string, string][];
  footerText?: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  // For internal navigation (e.g. "View this Chapter" jumping to another
  // screen), a real state-change callback, not an anchor tag. Distinct
  // from learnMoreHref, which is exclusively for genuine external
  // references and always opens in a new tab.
  onLearnMoreClick?: () => void;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-4 border border-line rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="font-sans text-[12px] font-semibold text-ink">{title}</span>
        <span
          className="text-clay transition-transform inline-block"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 fade-up">
          {bodyText && (
            <p className="font-sans text-[12px] text-clay leading-relaxed mb-3">{bodyText}</p>
          )}
          {children}
          {rows.length > 0 && (
            <div className="divide-y divide-line border-t border-line">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 font-sans text-[11px]">
                  <span className="text-clay">{k}</span>
                  <span className="text-ink text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
          {footerText && (
            <p className="text-[9px] text-clay font-sans mt-2 pt-2 border-t border-line leading-relaxed">
              {footerText}
            </p>
          )}
          {onLearnMoreClick ? (
            <button
              onClick={(e) => { e.stopPropagation(); onLearnMoreClick(); }}
              className="inline-block mt-3 font-sans text-[11px] text-[#9E4F63] underline underline-offset-2"
            >
              {learnMoreLabel}
            </button>
          ) : (
            learnMoreHref && (
              <a
                href={learnMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-sans text-[11px] text-[#9E4F63] underline underline-offset-2"
              >
                {learnMoreLabel}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}


// Calm, editorial loading transition, cycles through a few short phrases
// with a subtle fade, then calls onDone. Deliberately no progress bar or
// spinner, per the "luxury, not dashboard" direction.
export function ArchiveTransition({
  phrases,
  onDone,
}: {
  phrases: string[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const stepMs = 280;
    if (index >= phrases.length - 1) {
      const t = setTimeout(onDone, stepMs + 120);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIndex((i) => i + 1), stepMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="h-full flex items-center justify-center px-8">
      <p key={index} className="font-display italic text-lg text-clay fade-up text-center">
        {phrases[index]}
      </p>
    </div>
  );
}

export type ArchiveEntry = {
  year: string;
  category: string;
  title: string;
  description: string;
};

// The editorial replacement for the old plain lifecycle timeline, bigger
// per-entry blocks (category/title/description) and, per design direction,
// no literal "projected" label: completed entries get a filled marker,
// future ones a hollow marker, and that's the only signal.
export function ArchiveTimeline({
  entries,
  showProjectedTag = false,
}: {
  entries: ArchiveEntry[];
  showProjectedTag?: boolean;
}) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const color = useChapterColor();
  return (
    <div className="relative pl-5">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
      <div className="space-y-6">
        {entries.map((e, i) => {
          const isFuture = Number(e.year) > currentYear;
          return (
            <div
              key={i}
              className="relative fade-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className="absolute -left-5 top-[5px] w-2.5 h-2.5 rounded-full border-2 border-paper transition-colors duration-500"
                style={{
                  backgroundColor: isFuture ? "#FFFFFF" : color,
                  boxShadow: isFuture ? `inset 0 0 0 1.5px ${color}` : undefined,
                }}
              />
              <p
                className="font-sans text-[9px] uppercase tracking-[0.14em] font-semibold transition-colors duration-500 flex items-center gap-1.5"
                style={{ color: isFuture ? "#6E635A" : color }}
              >
                <span>{e.year} · {e.category}</span>
                {isFuture && showProjectedTag && (
                  <span
                    className="font-sans text-[8px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{ color: "#6E635A", backgroundColor: "#EDEBE7" }}
                  >
                    {t("archive_projected_tag")}
                  </span>
                )}
              </p>
              <p className={`font-display italic text-base mt-0.5 ${isFuture ? "text-clay" : "text-ink"}`}>
                {e.title}
              </p>
              <p className={`font-sans text-[11px] mt-0.5 leading-relaxed ${isFuture ? "text-clay" : "text-clay"}`}>
                {e.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// A direct-entry point into the same information Today's Edit and Garment
// Readiness already surface, just reachable by typing a question instead
// of scrolling. Deliberately narrow rather than open-ended: it pattern-
// matches against the three query types it can answer reliably (per the
// brief's own preference for "a narrower, reliable feature" over a broad
// unreliable one) and reuses the exact same deterministic functions
// TodaysEdit calls (pickFeaturedItem, naturalName, daysSinceLogged), not
// a new AI call, and not a duplicate of TodaysEdit's own internal state,
// since this renders as a sibling above it rather than needing to touch
// or restructure that component at all.
// A direct-entry point into the same information Today's Edit and Garment
// Readiness already surface, just reachable by typing (or speaking) a
// question instead of scrolling. The three example queries pattern-match
// reliably and reuse the exact same deterministic functions TodaysEdit
// calls (pickFeaturedItem, naturalName, daysSinceLogged) rather than a
// new AI call. TodaysEdit itself is never touched, this renders as a
// sibling above it and computes its own answers independently.
export function AskAnythingBar({ wardrobe }: { wardrobe: WardrobeItem[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  // Real attachment state, not a placeholder, a photo is genuinely
  // captured/compressed/attachable, and referencing a garment genuinely
  // changes which item the answer logic reasons about (see answerQuery
  // below, the referencedItem branch). Honest limitation: there's no
  // vision model wired in, so an attached photo's contents aren't
  // reasoned over by the (deterministic, not AI) answer logic, it's
  // real, functional UI state, but decorative to the current answer
  // engine until a real vision/AI backend exists to consume it.
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showGarmentPicker, setShowGarmentPicker] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [referencedItem, setReferencedItem] = useState<WardrobeItem | null>(null);

  const [micState, setMicState] = useState<"idle" | "requesting" | "recording" | "transcribing" | "error">("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const itemDisplayName = (item: WardrobeItem) => (item.nameKey ? t(item.nameKey) || item.name : item.name);

  const answerQuery = async (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return;
    setThinking(true);
    setAnswer(null);

    if (wardrobe.length === 0) {
      setTimeout(() => {
        setAnswer(t("ask_anything_empty_wardrobe"));
        setThinking(false);
      }, 300);
      return;
    }

    const prefix = referencedItem
      ? `${t("ask_anything_about_item")} ${naturalName(itemDisplayName(referencedItem), t("your_prefix"))}: `
      : "";

    // Type C, readiness/condition. If a specific garment was referenced
    // via the attach menu, answer about that garment specifically rather
    // than the generically featured one.
    if (/ready|readiness|condition/.test(q)) {
      const lines = [t("reason_condition"), t("ready_to_wear"), t("recently_maintained")].filter(Boolean);
      setTimeout(() => {
        setAnswer(prefix + lines.join(" "));
        setThinking(false);
      }, 350);
      return;
    }

    // Type B, hasn't been worn in a while. A referenced garment answers
    // "how long since I wore X specifically" instead of searching for
    // the single least-worn item overall.
    if (/haven'?t worn|not worn|worn in a while|long time/.test(q)) {
      if (referencedItem) {
        const days = daysSinceLogged(referencedItem.loggedAt);
        setTimeout(() => {
          setAnswer(
            days !== null
              ? `${t("ask_anything_days_since_worn").replace("{n}", String(days))} ${naturalName(itemDisplayName(referencedItem), t("your_prefix"))}.`
              : `${naturalName(itemDisplayName(referencedItem), t("your_prefix"))} ${t("ask_anything_never_logged")}.`
          );
          setThinking(false);
        }, 350);
        return;
      }
      let oldest: WardrobeItem | null = null;
      let oldestDays = -1;
      for (const item of wardrobe) {
        const days = daysSinceLogged(item.loggedAt);
        if (days !== null && days > oldestDays) {
          oldestDays = days;
          oldest = item;
        }
      }
      setTimeout(() => {
        if (oldest) {
          setAnswer(`${t("ask_anything_not_worn_intro")} ${naturalName(itemDisplayName(oldest), t("your_prefix"))}.`);
        } else {
          setAnswer(t("ask_anything_fallback"));
        }
        setThinking(false);
      }, 350);
      return;
    }

    // Type A, "what should I wear", the same weather-aware pick
    // Today's Edit itself shows.
    if (/wear today|wear now|should i wear|what to wear/.test(q)) {
      const weather = await fetchWeather();
      const featured = pickFeaturedItem(wardrobe, weather);
      const displayName = featured.nameKey ? t(featured.nameKey) || featured.name : featured.name;
      const itemName = naturalName(displayName, t("your_prefix"));
      const reasoningKey = getReasoningKey(weather);
      setAnswer(`${capitalizeFirst(itemName)}. ${t(reasoningKey as TranslationKey)}`);
      setThinking(false);
      return;
    }

    setTimeout(() => {
      setAnswer(t("ask_anything_fallback"));
      setThinking(false);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    answerQuery(query);
  };

  // Real attachment: an actual file, compressed and previewed, removable.
  const handlePhotoAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setShowAttachMenu(false);
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setAttachedPhoto(compressed);
    } catch {
      // photo attachment failing shouldn't block the rest of the input
    }
  };

  const handleReferenceGarment = (item: WardrobeItem) => {
    setReferencedItem(item);
    setShowGarmentPicker(false);
    setShowAttachMenu(false);
  };

  // Real ElevenLabs speech-to-text, reusing the exact same endpoint and
  // client helper built for the Morning Brief voice note feature
  // (api/transcribe.js, transcribeVoiceNote in lib/voice.ts) rather than
  // a new integration. Records via MediaRecorder, transcribes on stop,
  // populates the input, then submits automatically.
  const startVoiceInput = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicState("error");
      setMicError(t("mic_unavailable"));
      setTimeout(() => setMicState("idle"), 3000);
      return;
    }
    setMicState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setMicState("transcribing");
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          if (!base64) {
            setMicState("error");
            setMicError(t("mic_transcription_failed"));
            setTimeout(() => setMicState("idle"), 3000);
            return;
          }
          const transcript = await transcribeVoiceNote(base64, blob.type);
          if (transcript) {
            setQuery(transcript);
            setMicState("idle");
            answerQuery(transcript);
          } else {
            setMicState("error");
            setMicError(t("mic_transcription_failed"));
            setTimeout(() => setMicState("idle"), 3000);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setMicState("recording");
    } catch {
      setMicState("error");
      setMicError(t("mic_permission_denied"));
      setTimeout(() => setMicState("idle"), 3000);
    }
  };

  const stopVoiceInput = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleMicClick = () => {
    if (micState === "recording") {
      stopVoiceInput();
    } else if (micState === "idle" || micState === "error") {
      startVoiceInput();
    }
  };

  return (
    <div className="mb-6 relative">
      {attachedPhoto && (
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img src={attachedPhoto} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setAttachedPhoto(null)}
              aria-label={t("attach_remove_label")}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ink/70 text-white flex items-center justify-center"
            >
              <X size={9} />
            </button>
          </div>
        </div>
      )}
      {referencedItem && (
        <div className="flex items-center gap-1.5 mb-1.5 px-1">
          <span className="flex items-center gap-1 font-sans text-[10px] text-clay bg-blush-pale/50 rounded-full px-2 py-1">
            <Shirt size={10} />
            {itemDisplayName(referencedItem)}
            <button type="button" onClick={() => setReferencedItem(null)} aria-label={t("attach_remove_label")}>
              <X size={10} />
            </button>
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl px-3.5 pt-3 pb-2.5"
        style={{ backgroundColor: "rgb(var(--c-card))" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            micState === "recording"
              ? t("mic_recording_label")
              : micState === "transcribing"
              ? t("mic_transcribing_label")
              : t("ask_anything_placeholder")
          }
          disabled={micState === "recording" || micState === "transcribing"}
          className="w-full bg-transparent font-sans text-[13px] text-ink placeholder:text-clay focus:outline-none disabled:placeholder:text-[#9E4F63]"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="relative">
            <button
              type="button"
              aria-label="Add"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="w-7 h-7 rounded-full border border-clay/25 text-clay flex items-center justify-center shrink-0"
            >
              <Plus size={14} className={`transition-transform ${showAttachMenu ? "rotate-45" : ""}`} />
            </button>
            {showAttachMenu && (
              <div className="absolute bottom-9 left-0 bg-paper border border-line rounded-xl shadow-sm py-1 w-52 z-10">
                <label className="flex items-center gap-2 px-3 py-2 text-[12px] font-sans text-ink cursor-pointer hover:bg-blush-pale/30">
                  <Camera size={13} className="text-clay" />
                  {t("attach_add_photo")}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoAttach} />
                </label>
                <button
                  type="button"
                  onClick={() => setShowGarmentPicker(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-sans text-ink hover:bg-blush-pale/30 text-left"
                >
                  <Shirt size={13} className="text-clay" />
                  {t("attach_reference_garment")}
                </button>
              </div>
            )}
            {showGarmentPicker && (
              <div className="absolute bottom-9 left-0 bg-paper border border-line rounded-xl shadow-sm py-1 w-52 max-h-40 overflow-y-auto z-10">
                <p className="px-3 py-1.5 text-[9px] uppercase tracking-wide text-clay font-semibold">
                  {t("attach_choose_garment")}
                </p>
                {wardrobe.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleReferenceGarment(item)}
                    className="w-full text-left px-3 py-1.5 text-[12px] font-sans text-ink hover:bg-blush-pale/30"
                  >
                    {itemDisplayName(item)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMicClick}
              aria-label="Voice input"
              disabled={micState === "requesting" || micState === "transcribing"}
              className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${
                micState === "recording" ? "border-transparent bg-[#C97A8C] text-white" : "border-clay/25 text-clay"
              }`}
            >
              {micState === "recording" ? <Square size={11} fill="currentColor" /> : <Mic size={13} />}
            </button>
            <button
              type="submit"
              aria-label="Submit"
              disabled={!query.trim() || micState === "recording" || micState === "transcribing"}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#C97A8C" }}
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </form>

      {micState === "error" && micError && (
        <p className="mt-1.5 px-1 font-sans text-[10px] text-[#9E4F63]">{micError}</p>
      )}

      {(thinking || answer) && (
        <div className="mt-2.5 px-1 fade-up">
          {thinking ? (
            <p className="font-sans text-[11px] text-clay italic">…</p>
          ) : (
            <p className="font-display italic text-[14px] text-ink leading-relaxed">{answer}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function TodaysEdit({ wardrobe }: { wardrobe: WardrobeItem[] }) {
  const { t } = useLanguage();
  const color = useChapterColor();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    fetchWeather().then((w) => {
      if (w) {
        setWeather(w);
        setWeatherStatus("ready");
      } else {
        setWeatherStatus("unavailable");
      }
    });
  }, []);

  const featured = pickFeaturedItem(wardrobe, weather);
  const featuredDisplayName = featured.nameKey ? t(featured.nameKey) : featured.name;
  const itemName = naturalName(featuredDisplayName, t("your_prefix"));
  const alternatives = pickAlternatives(wardrobe, featured.name, 3);
  const days = daysSinceLogged(featured.loggedAt);
  const wornCount = parseWornCount(featured.worn) || 18;
  const nextMaintenanceIn = Math.max(2, 20 - (wornCount % 20));

  const isCold = weather ? weather.afternoonTempF < 60 : null;
  const isWet = weather ? weather.rainLikely : null;

  const observationKey = weather ? getWeatherObservationKey(weather) : "obs_default";
  const reasoningKey = getReasoningKey(weather);
  const notWornKey = getNotWornPhraseKey(days);

  const careSeasonForAtmosphere = getCurrentSeason();
  const timeOfDay = getTimeOfDay();
  const atmosphere = selectAtmosphere(careSeasonForAtmosphere, timeOfDay, weather?.rainLikely ?? false);
  const [interludeState, setInterludeState] = useState<"closed" | "transitioning" | "open">("closed");
  // The delayed entrance animation on the "Enter the Listening Room"
  // button should only ever happen once, the very first time someone
  // encounters it, checked and persisted via localStorage, not a
  // per-session flag, so it genuinely never repeats on later visits.
  const [showEntranceHint] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem("wornwith:seenInterludeButton");
      if (!seen) {
        localStorage.setItem("wornwith:seenInterludeButton", "1");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
  const [enterButtonHovered, setEnterButtonHovered] = useState(false);

  return (
    <div className="mb-7 pb-7 border-b border-line">
      <Eyebrow>{t("todays_edit_title")}</Eyebrow>

      {/* Hero: editorial weather observation, not raw data */}
      <p className="font-display italic text-2xl text-ink leading-snug mt-2">
        {weather ? t(observationKey as TranslationKey) : t("obs_default")}
      </p>

      {/* Recommended garment, the actual hero moment */}
      <p className="font-display italic text-lg mt-4 transition-colors duration-500" style={{ color }}>
        {capitalizeFirst(itemName)}
      </p>
      <p className="font-sans text-[12px] text-ink/80 leading-relaxed mt-1">
        {t(reasoningKey as TranslationKey)}
      </p>

      {/* Interlude, sits between Recommended Garment and Why This Piece,
          per the required flow. Calm teaser card, no artwork, no player
          chrome, the atmosphere title as an invitation, with a distinct
          secondary-style entrance button beneath it. */}
      <div className="mt-5 py-4 border-t border-b border-line">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color }}>
          {t("interlude_title")}
        </p>
        <p className="font-sans text-[11px] text-clay mt-1">{t("interlude_supporting")}</p>
        <p className="font-display italic text-base text-ink mt-1.5">{t(atmosphere.titleKey)}</p>

        <button
          onClick={() => setInterludeState("transitioning")}
          onMouseEnter={() => setEnterButtonHovered(true)}
          onMouseLeave={() => setEnterButtonHovered(false)}
          className={`font-sans text-[12px] text-white rounded-full px-6 py-2.5 mt-4 transition-all duration-300 active:opacity-70 cursor-pointer ${
            showEntranceHint ? "fade-up" : ""
          }`}
          style={{
            backgroundColor: enterButtonHovered ? "#0F1A33" : "#1B2951",
            animationDelay: showEntranceHint ? "800ms" : undefined,
          }}
        >
          {t("enter_listening_room")}
        </button>
      </div>

      {interludeState !== "closed" && (
        <ListeningRoom
          atmosphere={atmosphere}
          transitioning={interludeState === "transitioning"}
          onTransitionDone={() => setInterludeState("open")}
          onClose={() => setInterludeState("closed")}
          accentColor={color}
        />
      )}

      {/* Weather Summary, simplified, no raw metrics */}
      <div className="mt-5">
        {weatherStatus === "ready" && weather ? (
          <div className="flex items-center gap-5 font-sans text-[11px] text-clay">
            <span>{t("morning_label")} {weather.morningTempF}°</span>
            <span>{t("afternoon_label")} {weather.afternoonTempF}°</span>
            <span>{t("evening_label")} {weather.eveningTempF}°</span>
          </div>
        ) : weatherStatus === "loading" ? (
          <p className="font-sans text-[11px] text-clay italic">…</p>
        ) : (
          <p className="font-sans text-[10px] text-clay">{t("weather_unavailable")}</p>
        )}
        {weather && (
          <p className="font-sans text-[11px] text-clay mt-1">
            {weather.rainLikely ? t("rain_expected") : t("clear_expected")}
          </p>
        )}
      </div>

      {/* Why this piece */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-2">
          {t("why_this_piece_title")}
        </p>
        <ul className="space-y-1">
          {[
            (isCold || isWet || weather === null) && t("reason_temperature"),
            weather && isWet && t("reason_weather"),
            notWornKey && t(notWornKey as TranslationKey),
            t("reason_condition"),
            t("reason_impact"),
          ]
            .filter(Boolean)
            .map((line, i) => (
              <li key={i} className="font-sans text-[11px] text-ink/80 flex items-start gap-1.5">
                <span className="text-clay shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Morning Brief, reusable voice player, premium-ready */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-2">
          {t("morning_brief_title")}
        </p>
        <VoiceNoteRecorder />
      </div>

      {/* Also Consider */}
      {alternatives.length > 0 && (
        <div className="mt-5">
          <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-2">
            {t("alternatives_title")}
          </p>
          <ul className="space-y-1">
            {alternatives.map((a) => (
              <li key={a.name} className="font-sans text-[11px] text-ink/80 flex items-start gap-1.5">
                <span className="text-clay shrink-0">·</span>
                <span>{capitalizeFirst(naturalName(a.nameKey ? t(a.nameKey) : a.name, t("your_prefix")))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Garment Readiness */}
      <div className="mt-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E4F63] mb-2">
          {t("readiness_title")}
        </p>
        <p className="font-sans text-[11px] text-sage mb-0.5">{t("reason_condition")}</p>
        <p className="font-sans text-[11px] text-sage mb-0.5">{t("ready_to_wear")}</p>
        <p className="font-sans text-[11px] text-sage mb-2">{t("recently_maintained")}</p>
        <p className="font-sans text-[10px] text-clay">
          {t("estimated_maintenance")}: {t("estimated_after_wears").replace("{n}", String(nextMaintenanceIn))}
        </p>
      </div>
    </div>
  );
}


// A reusable narration player. The UI is finished and won't need to change
// when premium voice goes live, it already renders the same play/stop
// button regardless of which mode is actually speaking underneath.
export function VoicePlayer({
  text,
  listenLabel,
  stopLabel,
  unavailableLabel,
}: {
  text: string;
  listenLabel: string;
  stopLabel: string;
  unavailableLabel: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "unavailable">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ambient sound fades down while the story is being read, then returns.
  useEffect(() => {
    duckAmbient(state === "playing");
    return () => duckAmbient(false);
  }, [state]);

  const stop = () => {
    audioRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
  };

  const play = async () => {
    setState("loading");
    const result = await requestVoice(text);
    if (result.mode === "premium") {
      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.play();
      setState("playing");
    } else if (result.mode === "browser") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("idle");
      window.speechSynthesis.speak(utterance);
      setState("playing");
    } else {
      setState("unavailable");
    }
  };

  const color = useChapterColor();

  if (state === "unavailable") {
    return <p className="font-sans text-[10px] text-clay">{unavailableLabel}</p>;
  }

  return (
    <button
      onClick={state === "playing" ? stop : play}
      disabled={state === "loading"}
      className="flex items-center gap-2 border border-line rounded-full px-4 py-2 font-sans text-[11px] text-ink disabled:opacity-50 transition-colors duration-500"
    >
      {state === "playing" ? (
        <Square size={12} style={{ color }} fill={color} />
      ) : (
        <Mic size={13} style={{ color }} />
      )}
      {state === "playing" ? stopLabel : listenLabel}
    </button>
  );
}

// Records and saves a short voice note in the browser, genuinely
// functional via MediaRecorder, no fake states. When ELEVENLABS_API_KEY
// is configured (api/transcribe.js), the recording is also sent to
// ElevenLabs Speech-to-Text for a transcript; without a key, the note
// still saves and plays back perfectly, just without a transcript. This
// is a separate component from VoicePlayer above (which reads text
// aloud) since recording someone's own voice and playing synthesized
// speech are fundamentally different mechanisms, not variants of the
// same one.
// Product page hero: plays a short video once, then settles into a slow
// ambient crossfade loop between two stills. Layering (bottom to top):
// image1 sits as a permanent base, image2's opacity toggles to create the
// image1<->image2 crossfade once looping, and the video sits on top of
// both, fading out (revealing image1 already underneath) the moment it
// ends, that fade-out IS the video-to-image crossfade, no separate
// "hand off" state needed. Respects prefers-reduced-motion (skips video
// and the loop entirely, shows one static image) and falls back to the
// image loop if the video fails to load, errors, or silently never
// starts (autoplay blocked).
// Product page hero: two videos play back to back, then the hero settles
// into a slow ambient crossfade loop between two stills. One <video>
// element is reused for both clips (its src is swapped when video 1
// ends) rather than two separate elements, avoiding a double-load. A
// second, hidden <video preload="auto"> for clip 2 starts fetching the
// moment clip 1 begins playing, so by the time the handoff happens clip
// 2 is already cached and starts instantly rather than buffering.
//
// Layering (bottom to top) for the image-loop phase: image1 sits as a
// permanent base, image2's opacity toggles to create the image1<->image2
// crossfade, and the video sits on top of both, fading out at the very
// end (revealing image1 already underneath), that fade-out IS the
// video-to-image crossfade, no separate "hand off" state needed.
//
// Respects prefers-reduced-motion (skips both videos and the loop
// entirely, shows one static image) and falls back straight to the
// image loop if either video fails to load, errors, or silently never
// starts (autoplay blocked).
// Product page hero: a single video plays once, then the hero settles
// into a slow ambient slideshow, crossfading between two stills of the
// coat. Layering (bottom to top): image1 sits as a permanent base,
// image2's opacity toggles to create the image1<->image2 crossfade, and
// the video sits on top of both, fading out at the very end (revealing
// image1 already underneath), that fade-out IS the video-to-image
// crossfade, no separate "hand off" state needed.
//
// Respects prefers-reduced-motion (skips the video and the slideshow
// entirely, shows one static image) and falls back straight to the
// image slideshow if the video fails to load, errors, or silently never
// starts (autoplay blocked).
// Product page hero: a single video, looping continuously, no image
// slideshow, no sequencing state machine. Falls back to a static product
// photo (the same one used before any of this hero video work began) if
// the video fails to load, errors, or silently never starts (autoplay
// blocked), and respects prefers-reduced-motion by showing that same
// static photo with no motion at all, rather than leaving a blank space.
export function ProductHero({
  videoSrc,
  fallbackImageSrc,
  altText,
}: {
  videoSrc: string;
  fallbackImageSrc: string;
  altText: string;
}) {
  const [videoOk, setVideoOk] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
  }, []);

  useEffect(() => {
    if (reducedMotion || !videoOk) return;
    const video = videoRef.current;
    if (!video) return;

    const fallbackToStatic = () => setVideoOk(false);
    video.addEventListener("error", fallbackToStatic);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(fallbackToStatic);
    }

    // Safety net for a silent stall (network hang, autoplay quietly
    // blocked without rejecting the play() promise).
    const stallTimer = setTimeout(() => {
      if (video.paused) fallbackToStatic();
    }, 5000);

    return () => {
      video.removeEventListener("error", fallbackToStatic);
      clearTimeout(stallTimer);
    };
  }, [reducedMotion, videoOk]);

  if (reducedMotion || !videoOk) {
    return (
      <div aria-hidden="true" className="w-full h-64 overflow-hidden mb-4">
        <img src={fallbackImageSrc} alt={altText} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="relative w-full h-64 overflow-hidden mb-4">
      <video
        ref={videoRef}
        src={videoSrc}
        poster={fallbackImageSrc}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export function VoiceNoteRecorder() {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "requesting" | "recording" | "recorded" | "unavailable" | "denied">(
    () => (loadVoiceNote() ? "recorded" : "idle")
  );
  const [note, setNote] = useState<VoiceNote | null>(() => loadVoiceNote());
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("unavailable");
      return;
    }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          const newNote: VoiceNote = { audioDataUrl: dataUrl, createdAt: new Date().toISOString() };
          setNote(newNote);
          saveVoiceNote(newNote);
          setState("recorded");

          // Transcription is a background enhancement, the note is
          // already saved and playable before this even starts.
          const base64 = dataUrl.split(",")[1];
          if (base64) {
            setTranscribing(true);
            const transcript = await transcribeVoiceNote(base64, blob.type);
            setTranscribing(false);
            if (transcript) {
              const withTranscript = { ...newNote, transcript };
              setNote(withTranscript);
              saveVoiceNote(withTranscript);
            }
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const togglePlayback = () => {
    if (!note) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(note.audioDataUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const handleDelete = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    deleteVoiceNote();
    setNote(null);
    setState("idle");
  };

  if (state === "unavailable") {
    return <p className="font-sans text-[10px] text-clay">{t("mic_unavailable")}</p>;
  }
  if (state === "denied") {
    return <p className="font-sans text-[10px] text-clay">{t("mic_permission_denied")}</p>;
  }

  // Recorded, playback + re-record/delete, plus transcript once/if it
  // arrives.
  if (state === "recorded" && note) {
    return (
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePlayback}
            className="flex items-center gap-2 border border-ink rounded-full px-4 py-2 font-sans text-[11px] text-ink"
          >
            {isPlaying ? <Square size={12} fill="#1A1A1A" /> : <AudioLines size={14} />}
            {isPlaying ? t("stop_label") : t("play_note_label")}
          </button>
          <button onClick={startRecording} className="font-sans text-[10px] text-clay underline underline-offset-2">
            {t("re_record_label")}
          </button>
          <button onClick={handleDelete} aria-label={t("delete_note_label")} className="text-clay">
            <Trash2 size={13} />
          </button>
        </div>
        {transcribing && (
          <p className="font-sans text-[9px] text-clay mt-2 italic">…</p>
        )}
        {note.transcript && (
          <div className="mt-2">
            <p className="font-sans text-[9px] uppercase tracking-wide text-clay mb-0.5">
              {t("voice_note_transcript_label")}
            </p>
            <p className="font-sans text-[11px] text-ink/80 leading-relaxed italic">{note.transcript}</p>
          </div>
        )}
      </div>
    );
  }

  // Idle / requesting / recording, the pill button. Label stays
  // "Listen" at rest per request; switches to "Recording…" while active
  // so the state is never ambiguous.
  return (
    <button
      onClick={state === "recording" ? stopRecording : startRecording}
      disabled={state === "requesting"}
      className="flex items-center gap-2 bg-[#1A1A1A] rounded-full px-4 py-2 font-sans text-[11px] text-white disabled:opacity-50 transition-colors duration-300"
    >
      {state === "recording" ? (
        <Square size={12} fill="#FFFFFF" />
      ) : (
        <AudioLines size={14} />
      )}
      {state === "recording" ? t("recording_label") : t("listen_label")}
    </button>
  );
}

// The immersive full-screen "room", covers the app chrome entirely
// (progress bar, nav arrows included) for the "entering a quiet space"
// feel the brief asks for. Two phases: a brief white-space transition
// showing only INTERLUDE + the atmosphere title, then a staggered reveal
// of the room's sections. No spring animation, no parallax, opacity and
// small vertical offsets only.
export function ListeningRoom({
  atmosphere,
  transitioning,
  onTransitionDone,
  onClose,
  accentColor,
}: {
  atmosphere: Atmosphere;
  transitioning: boolean;
  onTransitionDone: () => void;
  onClose: () => void;
  accentColor: string;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!transitioning) return;
    const timer = setTimeout(onTransitionDone, 1100);
    return () => clearTimeout(timer);
  }, [transitioning, onTransitionDone]);

  return (
    <div className="fixed inset-0 z-50 bg-cream overflow-y-auto visible-scrollbar">
      {transitioning ? (
        <div className="h-full flex flex-col items-center justify-center px-8">
          <p
            className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold fade-up"
            style={{ color: accentColor }}
          >
            {t("interlude_title")}
          </p>
          <p
            className="font-display italic text-2xl text-ink mt-3 fade-up text-center"
            style={{ animationDelay: "300ms" }}
          >
            {t(atmosphere.titleKey)}
          </p>
        </div>
      ) : (
        <div className="min-h-full px-6 py-10 max-w-md mx-auto">
          <button
            onClick={onClose}
            className="font-sans text-[11px] text-clay mb-8"
          >
            ← {t("return_to_todays_edit")}
          </button>

          <div className="fade-up">
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: accentColor }}>
              {t("todays_atmosphere_title")}
            </p>
            <p className="font-display italic text-3xl text-ink mt-2">{t(atmosphere.titleKey)}</p>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "150ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("editorial_notes_title")}
            </p>
            {atmosphere.descriptionKeys.map((key, i) => (
              <p key={i} className="font-display italic text-[15px] text-ink leading-loose">
                {t(key)}
              </p>
            ))}
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "300ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("listening_nearby_title")}
            </p>
            <div className="space-y-1.5">
              {atmosphere.artists.map((artist) => (
                <p key={artist} className="font-sans text-[13px] text-ink">{artist}</p>
              ))}
            </div>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "450ms" }}>
            <p className="font-sans text-[10px] uppercase tracking-[0.14em] font-semibold text-clay mb-3">
              {t("reading_nearby_title")}
            </p>
            <div className="space-y-4">
              {atmosphere.reading.map((book) => (
                <div key={book.title}>
                  <p className="font-sans text-[13px] text-ink font-medium">{book.author}</p>
                  <p className="font-display italic text-[13px] text-ink/80">{book.title}</p>
                  <p className="font-sans text-[11px] text-clay mt-0.5">{t(book.noteKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up mt-10" style={{ animationDelay: "600ms" }}>
            <a
              href={spotifySearchUrl(atmosphere)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-line rounded-full px-5 py-2.5 font-sans text-[12px] text-ink"
              style={{ borderColor: accentColor }}
            >
              {t("continue_listening_label")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export type CareRitual = {
  icon: React.ReactNode;
  title: string;
  lines: string[];
};

// A single expandable "ritual" row, quiet by design. No film, no extra
// notes, just a title and a short instruction, in keeping with "no heavy
// accordion styling."
export function CareRitualRow({ ritual, entranceDelayMs }: { ritual: CareRitual; entranceDelayMs?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border-b border-line last:border-0 ${entranceDelayMs !== undefined ? "fade-up" : ""}`}
      style={entranceDelayMs !== undefined ? { animationDelay: `${entranceDelayMs}ms` } : undefined}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3 text-left"
      >
        <span className="shrink-0 w-5 flex justify-center text-[#8E3D52]">{ritual.icon}</span>
        <span className="font-sans text-[13px] text-ink flex-1">{ritual.title}</span>
        <span
          className="text-clay transition-transform inline-block shrink-0 text-sm"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
      </button>

      <div
        className="grid transition-all duration-400 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-3.5 pl-7 fade-up">
            {ritual.lines.map((line, i) => (
              <p key={i} className="font-sans text-[11px] text-clay leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Drives the "Crafted to Last" style editorial reveal: full staggered
// entrance the first time the section enters the viewport in this
// session, a quick simple fade on every re-entry after that, and no
// animation at all for prefers-reduced-motion. Session-scoped (not
// permanent) since the brief specifically says "during a session."
export function useEditorialReveal(sessionKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [firstReveal, setFirstReveal] = useState(true);
  const playedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      playedRef.current = sessionStorage.getItem(sessionKey) === "1";
    } catch {
      // ignore
    }

    if (reducedMotionRef.current) {
      setVisible(true);
      setFirstReveal(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const isFirst = !playedRef.current;
          setFirstReveal(isFirst);
          if (isFirst) {
            playedRef.current = true;
            try {
              sessionStorage.setItem(sessionKey, "1");
            } catch {
              // ignore
            }
          }
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Builds the opacity/transform/transition style for one element in the
  // sequence. On the very first reveal, elements slide in with their own
  // delay; on every later re-entry, everything just does one quick,
  // uniform 150ms opacity fade with no movement.
  const stepStyle = (
    translateFrom: string,
    delayMs: number,
    durationMs: number
  ): React.CSSProperties => {
    if (reducedMotionRef.current) {
      return { opacity: 1, transform: "none" };
    }
    if (!firstReveal) {
      return {
        opacity: visible ? 1 : 0,
        transform: "none",
        transition: "opacity 150ms ease-out",
      };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0,0)" : translateFrom,
      transition: `opacity ${durationMs}ms ease-out ${delayMs}ms, transform ${durationMs}ms ease-out ${delayMs}ms`,
    };
  };

  return { ref, visible, firstReveal, stepStyle };
}

// Simple mount-triggered reveal, used for the Story page's cinematic
// sequence, which plays every time the screen opens (unlike the
// session-gated Product page reveal). Flips true one frame after mount so
// CSS transitions actually animate from their initial state instead of
// snapping straight to visible.
export function useMountReveal() {
  const [visible, setVisible] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) {
      setVisible(true);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const stepStyle = (
    translateFrom: string,
    delayMs: number,
    durationMs: number
  ): React.CSSProperties => {
    if (reducedMotionRef.current) {
      return { opacity: 1, transform: "none" };
    }
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0,0)" : translateFrom,
      transition: `opacity ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    };
  };

  return { visible, reducedMotion: reducedMotionRef.current, stepStyle };
}

// One reusable "Verify this passport" panel, triggered from three
// different screens (Passport, Product, Story). A bottom sheet on the
// scale this app runs at (single-column mobile-first), dismissible via
// backdrop tap or the close button, matches the app's existing rounded
// corners, borders, and serif-italic heading treatment rather than
// introducing a new visual language.
export function VerificationInfoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const [check, setCheck] = useState<RecordCheck | null>(null);

  // Each time the panel opens, recompute this page's fingerprint and compare
  // it with the record published on Base.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setCheck(null);
    checkRecord().then((r) => { if (alive) setCheck(r); });
    return () => { alive = false; };
  }, [open]);

  if (!open) return null;

  const recordUrl = publicRecordUrl();
  const state = check?.state;
  const tone =
    state === "match" ? "good" : state === "mismatch" || state === "revoked" ? "bad" : "neutral";
  const status: { title: TranslationKey; sub?: TranslationKey } =
    !check ? { title: "vr_checking" }
    : state === "match" ? { title: "vr_match_title", sub: "vr_publisher_value" }
    : state === "mismatch" ? { title: "vr_mismatch_title", sub: "vr_mismatch_sub" }
    : state === "revoked" ? { title: "vr_revoked_title", sub: "vr_revoked_sub" }
    : state === "unreachable" ? { title: "vr_unreachable_title", sub: "vr_unreachable_sub" }
    : { title: "vr_unpublished_title", sub: "vr_unpublished_sub" };
  const published = ATTESTATION.publishedOn
    ? new Date(`${ATTESTATION.publishedOn}T12:00:00Z`).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })
    : t("record_not_published_short");

  const rows: [TranslationKey, React.ReactNode, boolean?][] = [
    ["vr_publisher", t("vr_publisher_value")],
    ["vr_passport", `${PASSPORT_ID} · ${GARMENT.name}`],
    ["vr_fingerprint", check ? `sha256 · ${shortHex(check.localHash, 8, 8)}` : "…", true],
    ["vr_published", published],
    ["vr_network", `${ATTESTATION.network} · ${ATTESTATION.service}`],
  ];

  return createPortal(
    <div className="fixed inset-0 h-[100dvh] w-full z-50" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={t("close_label")}
        className="absolute inset-0 h-[100dvh] w-full bg-ink/45 transition-opacity duration-300"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-verification-title"
        className="absolute bottom-0 inset-x-0 max-h-[88dvh] overflow-y-auto bg-paper rounded-t-[28px] border-t border-line px-6 pt-5 fade-up"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}
      >
        <div className="w-9 h-1 rounded-full bg-line mx-auto mb-5" />
        <div className="flex items-center justify-between mb-3">
          <h2 id="passport-verification-title" className="font-display italic text-xl text-ink">{t("verification_panel_title")}</h2>
          <button
            onClick={onClose}
            aria-label={t("close_label")}
            className="w-7 h-7 rounded-full flex items-center justify-center text-clay border border-line shrink-0"
          >
            ×
          </button>
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${
            tone === "good" ? "bg-sage/10 border-sage/35" : tone === "bad" ? "bg-blush/15 border-blush-deep/40" : "bg-cream border-line"
          }`}
        >
          <span
            aria-hidden="true"
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] shrink-0 ${
              tone === "good" ? "bg-[#5F7A5C] text-white" : tone === "bad" ? "bg-blush-deep text-white" : "border border-line text-clay"
            }`}
          >
            {tone === "good" ? "✓" : tone === "bad" ? "!" : "·"}
          </span>
          <span className="min-w-0">
            <span className="block font-sans text-[12.5px] font-semibold text-ink">{t(status.title)}</span>
            {status.sub && <span className="block font-sans text-[11px] text-clay mt-0.5">{t(status.sub)}</span>}
          </span>
        </div>

        <p className="font-sans text-[13px] text-clay leading-relaxed mt-4">{t(ATTESTATION.attestationUid ? "verification_panel_body" : "verification_panel_body_pending")}</p>
        <span className="inline-block mt-2 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-clay border border-line rounded-full px-2.5 py-1">
          {t("vr_demo_tag")}
        </span>

        <dl className="mt-4 border-t border-line">
          {rows.map(([label, value, mono]) => (
            <div key={label} className="grid grid-cols-[96px_1fr] gap-x-3 py-2.5 border-b border-line">
              <dt className="font-sans text-[8.5px] font-semibold uppercase tracking-[0.14em] text-clay pt-0.5">{t(label)}</dt>
              <dd className={`text-ink break-words ${mono ? "font-mono text-[11px] text-clay" : "font-sans text-[12px]"}`}>{value}</dd>
            </div>
          ))}
        </dl>

        {state === "match" && (
          <p className="mt-3 font-sans text-[12px] text-[#3D5A3A]">{"✓"} {t("vr_match_line")}</p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {recordUrl && (
            <a
              href={recordUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-1.5 border border-ink rounded-full py-3 font-sans text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink"
            >
              {t("vr_view_record")} {"↗"}
            </a>
          )}
          <a
            href={`/passport/${PASSPORT_ID}.json`}
            target="_blank"
            rel="noopener"
            className="text-center font-sans text-[10.5px] uppercase tracking-[0.18em] text-clay underline underline-offset-4 decoration-line py-1"
          >
            {t("vr_view_data")} {"↗"}
          </a>
        </div>

        <p className="mt-4 font-sans text-[12px] text-ink/85 leading-relaxed">{t("vr_resale")}</p>
        <p className="mt-3 font-sans text-[10.5px] text-clay leading-relaxed">
          <strong className="font-semibold text-ink/80">{t("vr_proves")}</strong> {t("vr_proves_body")}{" "}
          <strong className="font-semibold text-ink/80">{t("vr_not_proves")}</strong> {t("vr_not_proves_body")}
        </p>
      </section>
    </div>,
    document.body
  );
}

// The real, functional "Share Passport" experience, a bottom sheet with
// three genuinely working options, not a native share-sheet shortcut.
// PDF generates a real multi-page document from live app data (see
// lib/pdfExport.ts), QR renders an actual scannable code for the current
// URL, and Copy Link copies the real address. Same portal pattern as
// VerificationInfoPanel, for the same reason (escaping the fade-up
// transform containing-block issue).
export function ShareSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const [showQr, setShowQr] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "preparing" | "ready" | "error">("idle");

  if (!open) return null;

  const shareUrl = passportUrl(lang, GARMENT.dppId, typeof window !== "undefined" ? window.location.origin : undefined);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard access can fail (permissions, insecure context), the
      // link is still visible/selectable in the QR view as a fallback
    }
  };

  const handleGeneratePdf = async () => {
    if (pdfState === "preparing") return;
    setPdfState("preparing");
    try {
      // Loaded on demand: jsPDF is large and only needed when someone taps Save as PDF.
      const { generatePassportPdf } = await import("../lib/pdfExport");
      await generatePassportPdf();
      setPdfState("ready");
      setTimeout(() => setPdfState("idle"), 2200);
    } catch {
      setPdfState("error");
      setTimeout(() => setPdfState("idle"), 2500);
    }
  };

  return createPortal(
    <div className="fixed inset-0 h-[100dvh] w-full z-50" onClick={(e) => e.stopPropagation()}>
      <div
        className="absolute inset-0 h-[100dvh] bg-ink/40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 inset-x-0 max-h-[85dvh] overflow-y-auto bg-paper rounded-t-[28px] border-t border-line px-6 pt-5 fade-up"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 32px)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-display italic text-xl text-ink">{t("share_sheet_title")}</p>
          <button
            onClick={onClose}
            aria-label={t("close_label")}
            className="w-7 h-7 rounded-full flex items-center justify-center text-clay border border-line shrink-0"
          >
            ×
          </button>
        </div>
        <p className="font-sans text-[12px] text-clay leading-relaxed mb-5">
          {t("share_sheet_subtitle")}
        </p>

        <div className="divide-y divide-line border-y border-line">
          <div className="py-3.5">
            <p className="font-sans text-[13px] text-ink font-medium">{t("sharing_pdf_title")}</p>
            <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("share_sheet_pdf_desc")}</p>
            <button
              onClick={handleGeneratePdf}
              disabled={pdfState === "preparing"}
              className="font-sans text-[11px] font-medium mt-1.5 disabled:opacity-60"
              style={{ color: "#8E3D52" }}
            >
              {pdfState === "preparing"
                ? t("pdf_preparing_label")
                : pdfState === "ready"
                ? t("pdf_ready_label")
                : pdfState === "error"
                ? t("pdf_error_label")
                : `→ ${t("share_sheet_pdf_action")}`}
            </button>
          </div>

          <div className="py-3.5">
            <p className="font-sans text-[13px] text-ink font-medium">{t("sharing_qr_title")}</p>
            <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("share_sheet_qr_desc")}</p>
            {!showQr ? (
              <button
                onClick={() => setShowQr(true)}
                className="font-sans text-[11px] font-medium mt-1.5"
                style={{ color: "#8E3D52" }}
              >
                → {t("share_sheet_qr_action")}
              </button>
            ) : (
              <div className="mt-3 fade-up flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl border border-line">
                  <QRCodeSVG value={shareUrl} size={140} fgColor="#2B2622" />
                </div>
                <p className="font-sans text-[10px] text-clay mt-2 text-center">{t("scan_qr_hint")}</p>
              </div>
            )}
          </div>

          <div className="py-3.5">
            <p className="font-sans text-[13px] text-ink font-medium">{t("sharing_link_title")}</p>
            <p className="font-sans text-[11px] text-clay mt-0.5 leading-relaxed">{t("share_sheet_link_desc")}</p>
            <button
              onClick={handleCopyLink}
              className="font-sans text-[11px] font-medium mt-1.5"
              style={{ color: "#8E3D52" }}
            >
              → {linkCopied ? t("link_copied_confirmation") : t("share_sheet_link_action")}
            </button>
          </div>
        </div>

        <p className="font-sans text-[10px] text-clay leading-relaxed mt-4 text-center">
          {t("share_sheet_footer_note")}
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 border border-line rounded-full py-2.5 font-sans text-[12px] text-ink"
        >
          {t("cancel_label")}
        </button>
      </div>
    </div>,
    document.body
  );
}
