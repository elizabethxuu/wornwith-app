import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

test("a scanned tag opens this passport only when it carries this passport's ID", async () => {
  const { classifyTag } = await loadTs("lib/nfcTag");
  assert.deepEqual(classifyTag(["https://wornwith.care/en?dpp=4f2a"], [], "4f2a"), { state: "match" });
  assert.deepEqual(classifyTag(["https://www.wornwith.care/fr?dpp=4f2a"], [], "4f2a"), { state: "match" });
  assert.deepEqual(classifyTag(["https://wornwith.care/en?dpp=9z9z"], [], "4f2a"), { state: "other", dpp: "9z9z" });
  assert.deepEqual(classifyTag(["https://evil.example/?dpp=4f2a"], [], "4f2a"), { state: "no-passport" });
  assert.deepEqual(classifyTag(["https://wornwith.care.evil.example/?dpp=4f2a"], [], "4f2a"), { state: "no-passport" });
  assert.deepEqual(classifyTag(["not a url"], ["4f2a"], "4f2a"), { state: "match" });
  assert.deepEqual(classifyTag([], [], "4f2a"), { state: "no-passport" });
});
