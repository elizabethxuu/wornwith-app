// Care reminders for the coat, taken from its care rituals: brush it on
// Saturday mornings while it's in use, steam it monthly, store it for summer and
// bring it back for autumn. In the iPhone app they're notifications; on the
// website they're a calendar file. Pure, so it can be tested on its own.

export type ReminderRule =
  | { kind: "weekly"; weekday: number } // 0 = Sunday … 6 = Saturday
  | { kind: "monthly"; day: number }
  | { kind: "yearly"; month: number; day: number };

export type CareReminder = { id: number; key: "brush" | "steam" | "store" | "return"; rule: ReminderRule };

export const CARE_REMINDERS: CareReminder[] = [
  { id: 4101, key: "brush", rule: { kind: "weekly", weekday: 6 } },
  { id: 4102, key: "steam", rule: { kind: "monthly", day: 1 } },
  { id: 4103, key: "store", rule: { kind: "yearly", month: 4, day: 15 } },
  { id: 4104, key: "return", rule: { kind: "yearly", month: 10, day: 1 } },
];

export const REMINDER_HOUR = 9;

// The first time each reminder fires on or after `from`, at 9:00 local time.
export function firstOccurrence(rule: ReminderRule, from: Date): Date {
  const at = (y: number, m: number, d: number) => new Date(y, m, d, REMINDER_HOUR, 0, 0, 0);
  const y = from.getFullYear();
  const m = from.getMonth();
  if (rule.kind === "weekly") {
    const ahead = (rule.weekday - from.getDay() + 7) % 7;
    const sameDay = at(y, m, from.getDate() + ahead);
    return sameDay > from ? sameDay : at(y, m, from.getDate() + ahead + 7);
  }
  if (rule.kind === "monthly") {
    const thisMonth = at(y, m, rule.day);
    return thisMonth > from ? thisMonth : at(y, m + 1, rule.day);
  }
  const thisYear = at(y, rule.month - 1, rule.day);
  return thisYear > from ? thisYear : at(y + 1, rule.month - 1, rule.day);
}

const pad = (n: number) => String(n).padStart(2, "0");
const localStamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

function rrule(rule: ReminderRule): string {
  if (rule.kind === "weekly") return `FREQ=WEEKLY;BYDAY=${["SU", "MO", "TU", "WE", "TH", "FR", "SA"][rule.weekday]}`;
  if (rule.kind === "monthly") return `FREQ=MONTHLY;BYMONTHDAY=${rule.day}`;
  return `FREQ=YEARLY;BYMONTH=${rule.month};BYMONTHDAY=${rule.day}`;
}

// Lines longer than 75 octets are folded, as the calendar format requires.
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    const next = current + ch;
    if (new TextEncoder().encode(next).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildCareCalendar(text: (r: CareReminder) => { title: string; body: string }, now: Date): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Worn With Care//Care reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const r of CARE_REMINDERS) {
    const { title, body } = text(r);
    lines.push(
      "BEGIN:VEVENT",
      `UID:care-${r.key}@wornwith.care`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${localStamp(firstOccurrence(r.rule, now))}`,
      "DURATION:PT15M",
      `RRULE:${rrule(r.rule)}`,
      `SUMMARY:${escapeText(title)}`,
      `DESCRIPTION:${escapeText(body)}`,
      "URL:https://wornwith.care/",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(title)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
