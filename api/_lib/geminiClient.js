const GEMINI_MODEL = "gemini-2.0-flash";
const TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;

const isProd = process.env.VERCEL_ENV === "production";

function log(...args) {
  // Structured logging, development only — never runs in production, so
  // nothing about a request's content ends up in production logs.
  if (!isProd) {
    console.log("[ai]", ...args);
  }
}

async function callGeminiOnce(fullPrompt, maxTokens, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      const err = new Error(`Gemini HTTP ${response.status}: ${detail.slice(0, 200)}`);
      err.status = response.status;
      // 429 (quota) and 5xx (transient) are worth retrying; 400/401/403 are not.
      err.retryable = response.status === 429 || response.status >= 500;
      throw err;
    }

    const data = await response.json();

    // A 200 response doesn't mean content came back — Gemini can block
    // content via safety filters and still return HTTP 200 with no usable
    // text. This was the actual cause of "sometimes nothing is returned":
    // the old code treated that the same as a real (empty) success.
    if (data.promptFeedback?.blockReason) {
      const err = new Error(`Blocked by safety filter: ${data.promptFeedback.blockReason}`);
      err.retryable = false;
      throw err;
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      const err = new Error("No candidates in response");
      err.retryable = true;
      throw err;
    }

    if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
      const err = new Error(`Generation stopped: ${candidate.finishReason}`);
      err.retryable = false;
      throw err;
    }

    const text = candidate.content?.parts?.[0]?.text?.trim();
    if (!text) {
      const err = new Error("Empty response text");
      err.retryable = true;
      throw err;
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWithGemini(fullPrompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY not configured");
    err.retryable = false;
    err.status = 501;
    throw err;
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      log(`generation attempt ${attempt + 1}`);
      const start = Date.now();
      const text = await callGeminiOnce(fullPrompt, maxTokens, apiKey);
      log(`generation completed in ${Date.now() - start}ms`);
      return text;
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError") {
        lastError = new Error("Gemini request timed out");
        lastError.retryable = true;
      }
      log(`attempt ${attempt + 1} failed: ${lastError.message}`);
      if (!lastError.retryable || attempt === MAX_RETRIES) break;
      // Short backoff before retrying — 400ms, then 800ms.
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}
