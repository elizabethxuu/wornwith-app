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
