// Both gemini-2.0-flash and gemini-2.5-flash-lite failed for the same
// underlying reason: hardcoded, pinned model versions go stale as Google
// cuts off new-user access to older models. The actual fix is to stop
// pinning a specific version — "gemini-flash-latest" is Google's rolling
// alias that always points to their current recommended Flash model and
// updates automatically on their end, so this class of failure shouldn't
// recur. Still overridable via GEMINI_MODEL if needed.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;

export { GEMINI_MODEL };

// NOTE: while actively debugging the 502s, this logs unconditionally
// (not gated to non-production) — Vercel's function logs are the only
// way to see this on the live deployment, and the deployment itself runs
// with VERCEL_ENV=production, so a dev-only gate would have hidden
// exactly the logs needed right now. Re-add a production gate once this
// is confirmed working.
function log(...args) {
  console.log("[ai:debug]", ...args);
}

async function callGeminiOnce(fullPrompt, maxTokens, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const requestBody = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    // 1. Full Gemini HTTP status, always logged.
    log("Gemini HTTP status:", response.status, response.statusText);

    // Read the raw body as text FIRST, before attempting JSON.parse — this
    // way, if parsing fails, we still have the actual bytes Gemini sent
    // back instead of losing them.
    const rawText = await response.text();
    log("Gemini raw response body:", rawText.slice(0, 2000));

    if (!response.ok) {
      // Try to pull a structured error message out of Gemini's error
      // body if it's JSON; fall back to the raw text either way.
      let upstreamMessage = rawText;
      try {
        const parsed = JSON.parse(rawText);
        upstreamMessage = parsed?.error?.message || rawText;
      } catch (parseErr) {
        // 3. JSON parsing error, logged explicitly rather than swallowed.
        log("JSON parse error while parsing Gemini error body:", parseErr.message);
      }
      const err = new Error(upstreamMessage);
      err.status = response.status;
      err.detail = rawText;
      err.retryable = response.status === 429 || response.status >= 500;
      throw err;
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      // 3. JSON parsing error on a 200 response — this is a real,
      // surfaced failure, not silently treated as empty success.
      log("JSON parse error on 200 response:", parseErr.message);
      const err = new Error(`Response parsing failed: ${parseErr.message}`);
      err.detail = rawText;
      err.retryable = true;
      throw err;
    }

    if (data.promptFeedback?.blockReason) {
      const err = new Error(`Safety blocked: ${data.promptFeedback.blockReason}`);
      err.detail = JSON.stringify(data.promptFeedback);
      err.retryable = false;
      throw err;
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      const err = new Error("No candidates in Gemini response");
      err.detail = rawText;
      err.retryable = true;
      throw err;
    }

    if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
      const err = new Error(`Generation stopped: ${candidate.finishReason}`);
      err.detail = JSON.stringify(candidate);
      err.retryable = false;
      throw err;
    }

    const text = candidate.content?.parts?.[0]?.text?.trim();
    if (!text) {
      const err = new Error("Gemini returned an empty response");
      err.detail = rawText;
      err.retryable = true;
      throw err;
    }

    return text;
  } catch (err) {
    // 4. Any thrown exception, logged with its full detail before it
    // propagates up — nothing gets swallowed silently here.
    log("Exception in callGeminiOnce:", err.message, err.detail ? `| detail: ${err.detail.slice(0, 500)}` : "");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWithGemini(fullPrompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY not configured in this environment");
    err.retryable = false;
    err.status = 501;
    throw err;
  }

  log("API key present, length:", apiKey.length, "| prefix:", apiKey.slice(0, 4));

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
      log(`attempt ${attempt + 1} failed:`, lastError.message);
      if (!lastError.retryable || attempt === MAX_RETRIES) break;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}
