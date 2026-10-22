// Tests for the header tools: search matching and the saved theme. Run with: npm test
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTs } from "./_loadTs.mjs";

const { searchEntries, normalize } = await loadTs("lib/searchIndex");
const { readStoredTheme, saveTheme, isTheme, THEME_KEY } = await loadTs("lib/theme");

const entries = [
  { id: "care", label: "Care", hint: "care wash steam brush fold", screen: 4 },
  { id: "wardrobe", label: "Garde-robe", hint: "garde-robe tenues", screen: 9 },
  { id: "marais", label: "The Marais Coat", hint: "COS March dinner", screen: 9 },
];

test("search ignores case and accents and matches every typed word", () => {
  assert.equal(normalize("Garde-robe"), "garde robe");
  assert.deepEqual(searchEntries(entries, "WASH").map((e) => e.id), ["care"]);
  assert.deepEqual(searchEntries(entries, "garde robe").map((e) => e.id), ["wardrobe"]);
  assert.deepEqual(searchEntries(entries, "marais coat").map((e) => e.id), ["marais"]);
  assert.deepEqual(searchEntries(entries, "   "), []);
  assert.deepEqual(searchEntries(entries, "zzzz"), []);
});

let store;
beforeEach(() => {
  store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => void store.set(k, String(v)) };
});

test("theme defaults to light and only accepts light or dark", () => {
  assert.equal(readStoredTheme(), "light");
  store.set(THEME_KEY, "purple");
  assert.equal(readStoredTheme(), "light");
  assert.ok(isTheme("dark") && isTheme("light") && !isTheme("auto"));
});

test("a saved theme is read back", () => {
  saveTheme("dark");
  assert.equal(readStoredTheme(), "dark");
});

test("theme survives storage being unavailable", () => {
  globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(readStoredTheme(), "light");
  assert.doesNotThrow(() => saveTheme("dark"));
});

test("every header tool label exists in en, fr and pt", () => {
  const copy = readFileSync(new URL("../src/lib/i18n.tsx", import.meta.url), "utf8");
  for (const key of ["tool_search", "tool_voice", "tool_dark", "tool_light", "tool_language", "tool_search_placeholder", "tool_search_none", "tool_search_wardrobe"]) {
    const line = copy.match(new RegExp(`\\n  ${key}: \\{[^\\n]*\\}`))?.[0];
    assert.ok(line, `${key} missing`);
    for (const lang of ["en", "fr", "pt"]) assert.match(line, new RegExp(`${lang}: "[^"]{3,}"`), `${key} missing ${lang}`);
  }
});
