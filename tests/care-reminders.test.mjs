import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

test("each reminder's first date is the next one on or after today, at 9:00", async () => {
  const { CARE_REMINDERS, firstOccurrence } = await loadTs("lib/careReminders");
  const now = new Date(2026, 9, 23, 23, 0); // 23 Oct 2026, 11 pm
  const by = Object.fromEntries(CARE_REMINDERS.map((r) => [r.key, firstOccurrence(r.rule, now)]));
  assert.deepEqual([by.brush.getMonth(), by.brush.getDate(), by.brush.getDay(), by.brush.getHours()], [9, 24, 6, 9]); // Sat 24 Oct
  const satLate = firstOccurrence({ kind: "weekly", weekday: 6 }, new Date(2026, 9, 24, 10)); // Sat after 9:00
  assert.deepEqual([satLate.getMonth(), satLate.getDate()], [9, 31]);
  assert.deepEqual([by.steam.getMonth(), by.steam.getDate()], [10, 1]); // 1 Nov
  assert.deepEqual([by.store.getFullYear(), by.store.getMonth(), by.store.getDate()], [2027, 3, 15]); // 15 Apr 2027
  assert.deepEqual([by.return.getFullYear(), by.return.getMonth(), by.return.getDate()], [2027, 9, 1]); // 1 Oct 2027
  const dec = new Date(2026, 11, 31, 10, 0);
  const steam = firstOccurrence({ kind: "monthly", day: 1 }, dec);
  assert.deepEqual([steam.getFullYear(), steam.getMonth(), steam.getDate()], [2027, 0, 1]);
});

test("the calendar file is valid, repeating, and escapes text", async () => {
  const { buildCareCalendar } = await loadTs("lib/careReminders");
  const ics = buildCareCalendar((r) => ({ title: `Brush, then air; ${r.key}`, body: "A long line ".repeat(12) + "é" }), new Date(2026, 9, 23, 12));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 4);
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=SA/);
  assert.match(ics, /RRULE:FREQ=YEARLY;BYMONTH=4;BYMONTHDAY=15/);
  assert.ok(ics.includes(String.raw`SUMMARY:Brush\, then air\; brush`), "commas and semicolons are escaped");
  for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`);
});
