import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

test("a handover link round-trips a note and stamps, and rejects tampering", async () => {
  const m = await loadTs("lib/handover");
  const h = {
    v: 1,
    from: "Liz",
    note: "Wear it to the opera. Brush it after rain. ☂︎ — é ü 中文",
    at: "2027-03-01",
    stamps: [{ id: "a", place: "Copenhagen", month: "2026-12", shape: "oval", tilt: -7 }],
  };
  const back = m.readHandoverFromHash(`#handover=${m.encodeHandover(h)}`);
  assert.deepEqual(back, h);
  assert.equal(m.readHandoverFromHash("#nothing"), null);
  assert.equal(m.readHandoverFromHash("#handover=not-base64!!"), null);
  assert.equal(m.decodeHandover(m.encodeHandover({ ...h, v: 2 })), null);
  const long = m.decodeHandover(m.encodeHandover({ ...h, note: "x".repeat(5000), stamps: [{ place: "", month: "bad" }] }));
  assert.equal(long.note.length, m.MAX_HANDOVER_NOTE);
  assert.deepEqual(long.stamps, []);
});
