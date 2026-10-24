import { CARE_REMINDERS, REMINDER_HOUR, buildCareCalendar, type CareReminder } from "./careReminders";
import { isNativeApp } from "./apiBase";

// Turns the care reminders into iPhone notifications inside the app, or a
// calendar file on the website. Notifications are scheduled on the phone;
// nothing is sent anywhere.
const FLAG = "wornwith:COS-8821-4f2a:care-reminders";

export function remindersOn(): boolean {
  try { return localStorage.getItem(FLAG) === "on"; } catch { return false; }
}
function setFlag(on: boolean) {
  try { on ? localStorage.setItem(FLAG, "on") : localStorage.removeItem(FLAG); } catch { /* storage blocked */ }
}

type Text = (r: CareReminder) => { title: string; body: string };

// iOS calendar weekdays run 1 (Sunday) to 7 (Saturday).
function scheduleFor(r: CareReminder) {
  const rule = r.rule;
  if (rule.kind === "weekly") return { on: { weekday: rule.weekday + 1, hour: REMINDER_HOUR, minute: 0 } };
  if (rule.kind === "monthly") return { on: { day: rule.day, hour: REMINDER_HOUR, minute: 0 } };
  return { on: { month: rule.month, day: rule.day, hour: REMINDER_HOUR, minute: 0 } };
}

export type EnableResult = "on" | "denied" | "unsupported";

export async function enableReminders(text: Text): Promise<EnableResult> {
  if (!isNativeApp()) return "unsupported";
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return "denied";
  await LocalNotifications.cancel({ notifications: CARE_REMINDERS.map((r) => ({ id: r.id })) });
  await LocalNotifications.schedule({
    notifications: CARE_REMINDERS.map((r) => ({ id: r.id, ...text(r), schedule: scheduleFor(r) })),
  });
  setFlag(true);
  return "on";
}

export async function disableReminders(): Promise<void> {
  setFlag(false);
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: CARE_REMINDERS.map((r) => ({ id: r.id })) });
}

export function downloadCareCalendar(text: Text) {
  const ics = buildCareCalendar(text, new Date());
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "wornwith-care-reminders.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
