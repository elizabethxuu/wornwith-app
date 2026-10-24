import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

test("stamps collect once each, in order, and ignore stops that don't exist", async () => {
  const m = await loadTs("lib/stamps");
  assert.deepEqual(m.collectedStamps(), []);
  m.collectStamp(3);
  m.collectStamp(1);
  m.collectStamp(3);
  m.collectStamp(7);
  m.collectStamp(-1);
  assert.deepEqual(m.collectedStamps(), [1, 3]);
  m.collectStamp(0);
  m.collectStamp(2);
  assert.equal(m.collectedStamps().length, m.STAMP_COUNT);
});

test("owner stamps keep clean, bounded data and reject anything malformed", async () => {
  const m = await loadTs("lib/stamps");
  assert.equal(m.addOwnerStamp({ place: "   ", month: "2026-12" }), null);
  assert.equal(m.addOwnerStamp({ place: "Oslo", month: "2026-13" }), null);
  const a = m.addOwnerStamp({ place: "  Copenhagen  ", note: "first snow", month: "2026-12" });
  assert.equal(a.place, "Copenhagen");
  assert.equal(a.note, "first snow");
  const long = m.addOwnerStamp({ place: "x".repeat(80), month: "2027-01" });
  assert.equal(long.place.length, m.MAX_PLACE);
  assert.equal(m.loadOwnerStamps().length, 2);
  assert.equal(m.sanitizeOwnerStamp({ place: "Rio", month: "2026-12", tilt: 400, shape: "star" }).shape, "oval");
  m.removeOwnerStamp(a.id);
  assert.deepEqual(m.loadOwnerStamps().map((s) => s.place.length), [m.MAX_PLACE]);
  assert.equal(m.stampDate("2026-12"), "12 · 2026");
});
