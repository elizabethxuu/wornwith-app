import { EDITORIAL_SYSTEM_PROMPT } from "./_lib/editorialVoice.js";
import { FEATURES } from "./_lib/prompts.js";
import { generateWithGemini } from "./_lib/geminiClient.js";

// Same debugging note as geminiClient.js — unconditional logging for now,
// while tracking down the 502s. Re-gate to non-production once resolved.
function log(...args) {
  console.log("[ai:debug]", ...args);
}

function respond(res, status, body, start) {
  const payload = {
    success: body.success,
    content: body.content ?? null,
    error: body.error ?? null,
    metadata: body.feature ? { feature: body.feature, model: "gemini-2.0-flash" } : null,
    durationMs: Date.now() - start,
  };
  // 5. The exact response sent back to the frontend, logged before it goes out.
  log("responding with status", status, "body:", JSON.stringify(payload));
  res.status(status).json(payload);
}

export default async function handler(req, res) {
  const start = Date.now();

  if (req.method !== "POST") {
    respond(res, 405, { success: false, error: "Method not allowed" }, start);
    return;
  }

  const { feature, context } = req.body || {};
  const featureConfig = FEATURES[feature];

  if (!featureConfig) {
    respond(res, 400, { success: false, error: `Unknown feature: ${feature}`, feature }, start);
    return;
  }

  log("request received", { feature, context });

  const fullPrompt = `${EDITORIAL_SYSTEM_PROMPT}\n\n---\n\n${featureConfig.build(context || {})}`;

  try {
    const content = await generateWithGemini(fullPrompt, featureConfig.maxTokens);
    respond(res, 200, { success: true, content, feature }, start);
  } catch (err) {
    // 4. Never swallowed — the real message and, where we have it, the
    // real upstream detail both go back in the response body, not just
    // a generic "couldn't generate" string.
    log("generateWithGemini threw:", err.message, "| status:", err.status, "| detail:", err.detail);

    // Use the real upstream status when we have one (400 = invalid
    // request/model, 401/403 = invalid key, 404 = model not found, 429 =
    // quota) instead of collapsing everything to 502. Only genuinely
    // unexpected failures (network errors, timeouts, parse failures with
    // no status attached) fall back to 502.
    const status = err.status || 502;
    const errorMessage = err.detail
      ? `${err.message} | raw: ${String(err.detail).slice(0, 300)}`
      : err.message || "Generation failed";

    respond(res, status, { success: false, error: errorMessage, feature }, start);
  }
}
