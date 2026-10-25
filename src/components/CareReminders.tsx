import { useEffect, useRef, useState } from "react";
import { BellRing, CalendarPlus } from "lucide-react";
import { Eyebrow } from "./UI";
import { useLanguage, type TranslationKey } from "../lib/i18n";
import { isNativeApp } from "../lib/apiBase";
import { CARE_REMINDERS, type CareReminder } from "../lib/careReminders";
import { disableReminders, downloadCareCalendar, enableReminders, remindersOn, takeRemindersFocus, FOCUS_REMINDERS } from "../lib/reminders";
import { haptic } from "../lib/touches";

// On the Care screen: the coat's care rhythm as reminders. In the iPhone app
// they're notifications (one switch); on the website, a calendar file.
export function CareReminders() {
  const { t } = useLanguage();
  const native = isNativeApp();
  const [on, setOn] = useState(remindersOn);
  const [note, setNote] = useState<TranslationKey | null>(null);

  const text = (r: CareReminder) => ({
    title: t(`rem_${r.key}_title` as TranslationKey),
    body: t(`rem_${r.key}_body` as TranslationKey),
  });

  const toggle = async () => {
    if (on) {
      await disableReminders();
      setOn(false);
      setNote("rem_off_note");
      return;
    }
    const result = await enableReminders(text);
    if (result === "on") { setOn(true); setNote("rem_on_note"); haptic(14); }
    else if (result === "denied") setNote("rem_denied_note");
  };

  // Opened from the menu's bell: bring the card into view once the screen
  // has settled at the top, and give it a brief glow.
  const cardRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState(false);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const focus = () => {
      if (!takeRemindersFocus()) return;
      timers.push(setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setGlow(true);
      }, 450));
      timers.push(setTimeout(() => setGlow(false), 2400));
    };
    focus();
    window.addEventListener(FOCUS_REMINDERS, focus);
    return () => { window.removeEventListener(FOCUS_REMINDERS, focus); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div
      ref={cardRef}
      id="care-reminders"
      className={`border-t border-line pt-5 mt-6 -mx-3 px-3 pb-3 rounded-2xl transition-[background-color,box-shadow] duration-700 ${glow ? "bg-blush-pale/60 shadow-[0_0_0_1px_rgba(142,61,82,0.25)]" : ""}`}
    >
      <Eyebrow>{t("rem_title")}</Eyebrow>
      <p className="font-sans text-[12px] text-clay mt-2 leading-relaxed">{t("rem_sub")}</p>
      <ul className="mt-3 space-y-1.5">
        {CARE_REMINDERS.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-3 font-sans text-[12px]">
            <span className="text-ink">{t(`rem_${r.key}_title` as TranslationKey)}</span>
            <span className="text-clay text-right">{t(`rem_${r.key}_when` as TranslationKey)}</span>
          </li>
        ))}
      </ul>
      {native ? (
        <button
          onClick={toggle}
          aria-pressed={on}
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[12px] ${on ? "border border-line text-ink" : "bg-ink text-cream"}`}
        >
          <BellRing size={14} strokeWidth={1.6} />
          {t(on ? "rem_turn_off" : "rem_turn_on")}
        </button>
      ) : (
        <button
          onClick={() => { downloadCareCalendar(text); setNote("rem_calendar_note"); }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-2.5 font-sans text-[12px]"
        >
          <CalendarPlus size={14} strokeWidth={1.6} />
          {t("rem_add_calendar")}
        </button>
      )}
      {note && <p className="font-sans text-[11px] text-clay mt-2" role="status">{t(note)}</p>}
    </div>
  );
}
