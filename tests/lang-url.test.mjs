// Tests for the language URL helpers (/en, /fr, /pt). Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTs } from "./_loadTs.mjs";

const { langFromPathname, localizedUrl, isLang, LANGS } = await loadTs("lib/langUrl");

test("each supported language path is recognised", () => {
  assert.deepEqual(LANGS, ["en", "fr", "pt"]);
  assert.equal(langFromPathname("/en"), "en");
  assert.equal(langFromPathname("/fr"), "fr");
  assert.equal(langFromPathname("/pt"), "pt");
});

test("nested paths and trailing slashes still read the language", () => {
  assert.equal(langFromPathname("/fr/"), "fr");
  assert.equal(langFromPathname("/pt/care/guide"), "pt");
});

test("the language segment is case-insensitive", () => {
  assert.equal(langFromPathname("/FR"), "fr");
  assert.equal(langFromPathname("/Pt/x"), "pt");
});

test("no language in the path gives null", () => {
  assert.equal(langFromPathname("/"), null);
  assert.equal(langFromPathname(""), null);
  assert.equal(langFromPathname("/de"), null);
  assert.equal(langFromPathname("/care/en"), null);
  assert.equal(langFromPathname("/english"), null);
});

test("isLang only accepts the three supported languages", () => {
  assert.equal(isLang("en"), true);
  assert.equal(isLang("de"), false);
  assert.equal(isLang(null), false);
  assert.equal(isLang(undefined), false);
});

test("switching language swaps the segment and keeps query and hash", () => {
  const loc = { pathname: "/en", search: "?dpp=COS-8821-4f2a", hash: "" };
  assert.equal(localizedUrl("fr", loc), "/fr?dpp=COS-8821-4f2a");
  assert.equal(localizedUrl("pt", { pathname: "/fr/care", search: "?mode=deck", hash: "#top" }), "/pt/care?mode=deck#top");
});

test("a path with no language gets one added, and the root becomes /lang", () => {
  assert.equal(localizedUrl("en", { pathname: "/", search: "", hash: "" }), "/en");
  assert.equal(localizedUrl("fr", { pathname: "/care", search: "?x=1", hash: "" }), "/fr/care?x=1");
});

test("choosing the current language returns the same address", () => {
  const loc = { pathname: "/pt/care", search: "?mode=tag", hash: "#a" };
  assert.equal(localizedUrl("pt", loc), `${loc.pathname}${loc.search}${loc.hash}`);
});
