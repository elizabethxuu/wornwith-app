// Tests for the signed passport record: the public copy must match what the app
// fingerprints, and the live check must report each outcome honestly.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { loadTs } from "./_loadTs.mjs";

const publicFile = (id) => readFileSync(new URL(`../public/passport/${id}.json`, import.meta.url), "utf8");

test("the public record file is exactly the canonical record (run npm run passport:record if this fails)", async () => {
  const m = await loadTs("lib/passportRecord");
  assert.equal(publicFile(m.PASSPORT_ID), m.canonicalJson(m.PASSPORT_RECORD));
});

test("the fingerprint is the SHA-256 of the public file, so anyone can recompute it", async () => {
  const m = await loadTs("lib/passportRecord");
  const expected = "0x" + createHash("sha256").update(publicFile(m.PASSPORT_ID)).digest("hex");
  assert.equal(await m.fingerprint(), expected);
});

test("canonical JSON ignores key order", async () => {
  const m = await loadTs("lib/passportRecord");
  assert.equal(m.canonicalJson({ b: 1, a: { d: [2, 1], c: "x" } }), m.canonicalJson({ a: { c: "x", d: [2, 1] }, b: 1 }));
});

test("the record is labelled as demonstration data and holds no owner data", async () => {
  const m = await loadTs("lib/passportRecord");
  const json = m.canonicalJson(m.PASSPORT_RECORD);
  assert.equal(m.PASSPORT_RECORD.status, "demonstration");
  assert.match(m.PASSPORT_RECORD.disclaimer, /not been independently verified/);
  for (const field of ["ownedSince", "timesWorn", "condition", "moment"]) assert.ok(!json.includes(field), `record contains ${field}`);
});

function fakeFetch(body, ok = true) {
  return async () => ({ ok, json: async () => body });
}
const attestation = (hash, extra = {}) => ({
  data: { attestation: { id: "0xabc", attester: "0xPublisher", revoked: false, time: 1761200000, decodedDataJson: JSON.stringify([{ name: "recordHash", value: { value: hash } }]), ...extra } },
});

test("before publishing, the check says unpublished and makes no request", async () => {
  const m = await loadTs("lib/passportRecord");
  let called = false;
  const r = await m.checkRecord(async () => { called = true; });
  assert.equal(r.state, "unpublished");
  assert.equal(called, false);
});

test("after publishing, the check reports match, mismatch, revoked and unreachable", async () => {
  const m = await loadTs("lib/passportRecord");
  m.ATTESTATION.attestationUid = "0xabc";
  const hash = await m.fingerprint();
  assert.equal((await m.checkRecord(fakeFetch(attestation(hash.toUpperCase().replace("0X", "0x"))))).state, "match");
  assert.equal((await m.checkRecord(fakeFetch(attestation("0x" + "0".repeat(64))))).state, "mismatch");
  assert.equal((await m.checkRecord(fakeFetch(attestation(hash, { revoked: true })))).state, "revoked");
  assert.equal((await m.checkRecord(fakeFetch({}, false))).state, "unreachable");
  assert.equal((await m.checkRecord(async () => { throw new Error("offline"); })).state, "unreachable");
});

test("a record published by a different wallet does not count as a match", async () => {
  const m = await loadTs("lib/passportRecord");
  m.ATTESTATION.attestationUid = "0xabc";
  m.ATTESTATION.publisherAddress = "0xRealPublisher";
  const hash = await m.fingerprint();
  assert.equal((await m.checkRecord(fakeFetch(attestation(hash)))).state, "mismatch");
  assert.equal((await m.checkRecord(fakeFetch(attestation(hash, { attester: "0xrealpublisher" })))).state, "match");
});
