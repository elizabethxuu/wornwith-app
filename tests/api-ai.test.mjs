// Focused tests for the /api/ai handler. They mock the provider's fetch, so no
// network, keys, or paid calls are involved. Run with: npm test
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ai.js";

const realFetch = globalThis.fetch;
const realEnv = { ...process.env };
let logged;

function mockRes() {
  const res = { statusCode: 200, headers: {}, body: null };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (b) => ((res.body = b), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  return res;
}
const post = (body) => ({ method: "POST", body });
const gemini = (parts, finishReason = "STOP") => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason, content: { parts } }] }) });
const failure = (status) => ({ ok: false, status, json: async () => ({ error: { message: "SECRET-PROVIDER-DETAIL key=AIzaSECRET" } }) });

beforeEach(() => {
  logged = [];
  for (const level of ["log", "info", "warn", "error"]) console[level] = (...a) => logged.push(JSON.stringify(a));
  process.env.GEMINI_API_KEY = "AIzaSECRETKEY123";
  delete process.env.ANTHROPIC_API_KEY;
});
afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...realEnv };
  for (const level of ["log", "info", "warn", "error"]) delete console[level];
});

const noLeaks = (res) => {
  const out = JSON.stringify(res.body) + logged.join("");
  assert.ok(!out.includes("AIzaSECRET"), "API key or fragment leaked");
  assert.ok(!out.includes("SECRET-PROVIDER-DETAIL"), "provider body leaked");
};

test("returns generated text and sends the key in a header, not the URL", async () => {
  let seen;
  globalThis.fetch = async (url, init) => ((seen = { url: String(url), init }), gemini([{ text: "A quiet evening." }]));
  const res = mockRes();
  await handler(post({ feature: "reflection", context: { momentText: "dinner" } }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content, "A quiet evening.");
  assert.ok(!seen.url.includes("AIza") && !seen.url.includes("key="));
  assert.equal(seen.init.headers["x-goog-api-key"], "AIzaSECRETKEY123");
  const sent = JSON.parse(seen.init.body);
  assert.ok(sent.generationConfig.maxOutputTokens > 60, "keeps headroom for model reasoning");
});

test("ignores reasoning parts and joins visible text", async () => {
  globalThis.fetch = async () => gemini([{ text: "hidden", thought: true }, { text: "Visible " }, { text: "words." }]);
  const res = mockRes();
  await handler(post({ feature: "reflection", context: {} }), res);
  assert.equal(res.body.content, "Visible words.");
});

test("retries an empty response, then succeeds", async () => {
  let calls = 0;
  globalThis.fetch = async () => (++calls === 1 ? gemini([], "MAX_TOKENS") : gemini([{ text: "Second try." }]));
  const res = mockRes();
  await handler(post({ feature: "reflection", context: {} }), res);
  assert.equal(calls, 2);
  assert.equal(res.body.content, "Second try.");
});

test("provider failure returns a safe message and leaks nothing", async () => {
  globalThis.fetch = async () => failure(403);
  const res = mockRes();
  await handler(post({ feature: "reflection", context: { momentText: "private text" } }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /temporarily unavailable/);
  noLeaks(res);
  assert.ok(!logged.join("").includes("private text"), "user text must not be logged");
});

test("rate limit maps to 429 with a calm message", async () => {
  globalThis.fetch = async () => failure(429);
  const res = mockRes();
  await handler(post({ feature: "reflection", context: {} }), res);
  assert.equal(res.statusCode, 429);
  noLeaks(res);
});

test("missing key returns a safe 502 and does not call the network", async () => {
  delete process.env.GEMINI_API_KEY;
  let called = false;
  globalThis.fetch = async () => ((called = true), gemini([{ text: "x" }]));
  const res = mockRes();
  await handler(post({ feature: "reflection", context: {} }), res);
  assert.equal(called, false);
  assert.equal(res.statusCode, 502);
  assert.ok(!JSON.stringify(res.body).includes("GEMINI_API_KEY"));
});

test("falls back to Anthropic only when its key is configured", async () => {
  process.env.ANTHROPIC_API_KEY = "sk-ant-SECRET";
  globalThis.fetch = async (url) =>
    String(url).includes("anthropic.com")
      ? { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: "Fallback sentence." }] }) }
      : failure(500);
  const res = mockRes();
  await handler(post({ feature: "reflection", context: {} }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content, "Fallback sentence.");
  assert.ok(!logged.join("").includes("sk-ant-SECRET"));
});

test("rejects unknown and prototype feature names, wrong methods and oversized context", async () => {
  globalThis.fetch = async () => assert.fail("provider must not be called");
  for (const feature of ["nope", "constructor", "__proto__", undefined]) {
    const res = mockRes();
    await handler(post({ feature, context: {} }), res);
    assert.equal(res.statusCode, 400, String(feature));
  }
  let res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
  res = mockRes();
  await handler(post({ feature: "reflection", context: { momentText: "x".repeat(5000) } }), res);
  assert.equal(res.statusCode, 413);
});
