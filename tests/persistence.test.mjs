// Tests for the saved-data code (localStorage). A small in-memory fake stands in
// for the browser's storage, so no browser is needed. Run with: npm test
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

function fakeStorage() {
  const data = new Map();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}

let store;
beforeEach(() => {
  store = fakeStorage();
  globalThis.localStorage = store;
});
globalThis.localStorage = fakeStorage();
// Not under test here: make sure nothing tries to send data anywhere.
globalThis.fetch = async () => {
  throw new Error("fetch should not be called");
};

const p = await loadTs("lib/persistence");
const K = (name) => `wornwith:COS-8821-4f2a:${name}`;

test("moment: empty by default, saved text comes back", () => {
  assert.equal(p.loadMoment(), "");
  p.saveMoment("Dinner in Paris");
  assert.equal(p.loadMoment(), "Dinner in Paris");
});

test("moments: addMoment appends, and updateMomentSummary patches the matching one", async () => {
  assert.deepEqual(p.loadMoments(), []);
  const first = p.addMoment("First");
  assert.equal(first.length, 1);
  // moments are matched by timestamp, so make sure the two get different ones
  await new Promise((r) => setTimeout(r, 5));
  const second = p.addMoment("Second");
  assert.equal(second.length, 2);
  const stamp = second[0].savedAt;
  const updated = p.updateMomentSummary(stamp, "A summary");
  assert.equal(updated[0].summary, "A summary");
  assert.equal(p.loadMoments()[0].summary, "A summary");
  assert.equal(p.loadMoments()[1].summary, undefined);
});

test("moments: broken JSON gives an empty list", () => {
  store.setItem(K("moments"), "{not json");
  assert.deepEqual(p.loadMoments(), []);
});

test("moments: entries without text and savedAt strings are dropped", () => {
  store.setItem(K("moments"), JSON.stringify([{ text: "ok", savedAt: "2026-01-01" }, { text: 5, savedAt: "x" }, null, "str", { text: "no date" }]));
  assert.deepEqual(p.loadMoments(), [{ text: "ok", savedAt: "2026-01-01" }]);
});

test("moments: a non-array value gives an empty list", () => {
  store.setItem(K("moments"), JSON.stringify({ text: "x", savedAt: "y" }));
  assert.deepEqual(p.loadMoments(), []);
});

test("wardrobe: defaults when nothing saved, and saved items round-trip", () => {
  assert.equal(p.loadWardrobe().length, 3);
  p.saveWardrobe([{ name: "Scarf", tag: null, worn: "1×", note: "n" }]);
  assert.deepEqual(p.loadWardrobe().map((i) => i.name), ["Scarf"]);
});

test("wardrobe: broken JSON and wrong shapes fall back safely", () => {
  store.setItem(K("wardrobe"), "oops");
  assert.equal(p.loadWardrobe().length, 3);
  store.setItem(K("wardrobe"), JSON.stringify({ name: "not an array" }));
  assert.equal(p.loadWardrobe().length, 3);
  store.setItem(K("wardrobe"), JSON.stringify([{ name: "Keep" }, { name: 7 }, null, 4]));
  assert.deepEqual(p.loadWardrobe().map((i) => i.name), ["Keep"]);
});

test("ownership record: round-trips, and non-object data gives an empty record", () => {
  assert.deepEqual(p.loadOwnershipRecord(), {});
  p.saveOwnershipRecord({ owner: "Liz", notes: "Loved" });
  assert.deepEqual(p.loadOwnershipRecord(), { owner: "Liz", notes: "Loved" });
  for (const bad of ["[1,2]", "null", "42", "\"text\"", "{broken"]) {
    store.setItem(K("ownership-record"), bad);
    assert.deepEqual(p.loadOwnershipRecord(), {}, `input ${bad}`);
  }
});

test("voice note: needs a string audioDataUrl, and can be deleted", () => {
  assert.equal(p.loadVoiceNote(), null);
  p.saveVoiceNote({ audioDataUrl: "data:audio/webm;base64,AAA", createdAt: "2026-01-01T00:00:00Z" });
  assert.equal(p.loadVoiceNote().audioDataUrl, "data:audio/webm;base64,AAA");
  store.setItem(K("morning-brief-voice-note"), JSON.stringify({ audioDataUrl: 5 }));
  assert.equal(p.loadVoiceNote(), null);
  store.setItem(K("morning-brief-voice-note"), "garbage");
  assert.equal(p.loadVoiceNote(), null);
  p.saveVoiceNote({ audioDataUrl: "data:x", createdAt: "t" });
  p.deleteVoiceNote();
  assert.equal(p.loadVoiceNote(), null);
});

test("storage that throws never breaks loading or saving", () => {
  const boom = () => {
    throw new Error("storage blocked");
  };
  globalThis.localStorage = { getItem: boom, setItem: boom, removeItem: boom };
  assert.equal(p.loadMoment(), "");
  assert.deepEqual(p.loadMoments(), []);
  assert.equal(p.loadWardrobe().length, 3);
  assert.deepEqual(p.loadOwnershipRecord(), {});
  assert.equal(p.loadVoiceNote(), null);
  assert.doesNotThrow(() => {
    p.saveMoment("x");
    p.saveWardrobe([]);
    p.saveOwnershipRecord({});
    p.saveVoiceNote({ audioDataUrl: "d", createdAt: "t" });
    p.deleteVoiceNote();
    p.addMoment("x");
  });
});
