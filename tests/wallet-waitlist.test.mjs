import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPassJson, cleanPassInput, readPassConfig } from "../api/_lib/passJson.js";
import { cleanSignup, publicStats, redisConfig, PUBLIC_FROM } from "../api/_lib/waitlist.js";

const ids = { passTypeIdentifier: "pass.care.wornwith.passport", teamIdentifier: "ABCDE12345" };

test("pass input keeps only a language, a wear count and a short name", () => {
  assert.deepEqual(cleanPassInput({ lang: "de", worn: "18x", owner: "  Liz <b>Xu</b>\n" }), { lang: "en", worn: 18, owner: "Liz bXu/b" });
  assert.deepEqual(cleanPassInput({ lang: "fr", worn: "0" }), { lang: "fr", worn: null, owner: null });
  assert.equal(cleanPassInput({ owner: "x".repeat(80) }).owner.length, 40);
});

test("the pass speaks the visitor's language and opens their passport", () => {
  const fr = buildPassJson({ lang: "fr", worn: 18, owner: null }, ids);
  assert.equal(fr.generic.primaryFields[0].value, "Manteau en laine noire");
  assert.equal(fr.generic.headerFields[0].value, "18×");
  assert.equal(fr.barcodes[0].message, "https://wornwith.care/fr?dpp=4f2a");
  assert.equal(fr.passTypeIdentifier, ids.passTypeIdentifier);
  const en = buildPassJson({ lang: "en", worn: null, owner: "Elizabeth Xu" }, ids);
  assert.deepEqual(en.generic.headerFields, []);
  assert.equal(en.generic.secondaryFields[0].value, "Elizabeth Xu");
  assert.ok(en.generic.auxiliaryFields.some((f) => f.value === "21,400 km"));
});

test("the pass stays off until every certificate is set", () => {
  assert.equal(readPassConfig({}).ready, false);
  const pem = "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----";
  const env = { APPLE_PASS_TYPE_ID: "p", APPLE_TEAM_ID: "t", APPLE_PASS_CERT: pem, APPLE_PASS_KEY: Buffer.from(pem).toString("base64"), APPLE_WWDR_CERT: pem.replace(/\n/g, "\\n") };
  const cfg = readPassConfig(env);
  assert.equal(cfg.ready, true);
  assert.equal(cfg.signerKey, pem);
  assert.equal(cfg.wwdr, pem);
});

test("waitlist sign-ups need a real-looking email and a piece", () => {
  assert.deepEqual(cleanSignup({ email: "nope", piece: "A coat" }), { ok: false, error: "email" });
  assert.deepEqual(cleanSignup({ email: "a@b.co", piece: "   " }), { ok: false, error: "piece" });
  const ok = cleanSignup({ email: " Liz@Example.COM ", piece: "My grandmother's\ncamel coat", kind: "hack", lang: "pt" });
  assert.deepEqual(ok, { ok: true, email: "liz@example.com", piece: "My grandmother's camel coat", kind: "other", lang: "pt" });
});

test("the count and most-named piece stay hidden until there are enough people", () => {
  assert.deepEqual(publicStats(PUBLIC_FROM - 1, ["coat", "5"]), { count: null, top: null });
  assert.deepEqual(publicStats("42", ["other", "30", "leather", "8", "coat", "4"]), { count: 42, top: "leather" });
  assert.deepEqual(publicStats(12, ["other", "12"]), { count: 12, top: null });
});

test("the waitlist reads Vercel's Upstash variables", () => {
  assert.equal(redisConfig({}), null);
  assert.deepEqual(redisConfig({ KV_REST_API_URL: "https://x.upstash.io/", KV_REST_API_TOKEN: "t" }), { url: "https://x.upstash.io", token: "t" });
});
