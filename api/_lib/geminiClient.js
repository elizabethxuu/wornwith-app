// Gemini text generation for the AI features. Server-side only: the API key
// never reaches the browser, and provider error bodies are never returned to
// visitors (see api/ai.js).
//
// "gemini-flash-latest" is Google's rolling alias, so a pinned model that Google
// retires cannot silently break generation. Override with GEMINI_MODEL if needed.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;

// Current Flash models can spend part of maxOutputTokens on internal reasoning.
// With the very small budgets these short features use (50 to 160 tokens), the
// reasoning alone can use the whole budget and leave no visible text, which
// shows up as an "empty response". This headroom keeps the visible answer short
// (the prompts ask for one or two sentences) while leaving room to think.
const REASONING_HEADROOM_TOKENS = 1024;

export { GEMINI_MODEL };

// Diagnostics never include the API key, key fragments, prompts, user text,
// or provider response bodies. Status codes and short reasons only.
function debug(message, fields) {
  if (process.env.NODE_ENV !== "production") console.info(`[ai] ${message}`, fields ?? "");
}

function providerError(message, { status, retryable }) {
  const err = new Error(message);
  err.status = status;
  err.retryable = retryable;
  return err;
}

async function callGeminiOnce(fullPrompt, maxTokens, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        // The key travels in a header, not in the URL, so it cannot end up in logs or error text.
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: maxTokens + REASONING_HEADROOM_TOKENS, temperature: 0.7 },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw providerError(`Gemini returned HTTP ${response.status}`, {
        status: response.status,
        retryable: response.status === 429 || response.status >= 500,
      });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw providerError("Gemini returned unreadable JSON", { retryable: true });
    }

    if (data.promptFeedback?.blockReason) {
      throw providerError(`Gemini blocked the prompt (${data.promptFeedback.blockReason})`, { retryable: false });
    }

    const candidate = data.candidates?.[0];
    if (!candidate) throw providerError("Gemini returned no candidates", { retryable: true });

    if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
      throw providerError(`Gemini stopped (${candidate.finishReason})`, { retryable: false });
    }

    // Join all visible text parts and skip reasoning ("thought") parts.
    const text = (candidate.content?.parts ?? [])
      .filter((part) => typeof part.text === "string" && !part.thought)
      .map((part) => part.text)
      .join("")
      .trim();

    if (!text) {
      throw providerError(`Gemini returned no text (${candidate.finishReason || "no finish reason"})`, { retryable: true });
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateWithGemini(fullPrompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw providerError("Gemini is not configured", { status: 501, retryable: false });

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callGeminiOnce(fullPrompt, maxTokens, apiKey);
    } catch (err) {
      lastError = err.name === "AbortError" ? providerError("Gemini request timed out", { retryable: true }) : err;
      debug("Gemini attempt failed", { attempt: attempt + 1, status: lastError.status, reason: lastError.message });
      if (!lastError.retryable || attempt === MAX_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}
