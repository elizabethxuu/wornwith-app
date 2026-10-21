import { EDITORIAL_SYSTEM_PROMPT } from "./_lib/editorialVoice.js";
import { FEATURES } from "./_lib/prompts.js";
import { generateWithGemini, GEMINI_MODEL } from "./_lib/geminiClient.js";
import { generateWithAnthropic, anthropicConfigured } from "./_lib/anthropicClient.js";

const MAX_CONTEXT_CHARS = 4000;

// Visitors only ever see these short messages. Provider details (status codes,
// response bodies, key information) stay out of the response and out of logs.
const SAFE_ERRORS = {
  unavailable: "Reflection is temporarily unavailable. Please try again.",
  busy: "Reflection is busy right now. Please try again in a moment.",
  badRequest: "That request could not be processed.",
};

function respond(res, status, body, start, model) {
  res.status(status).json({
    success: body.success,
    content: body.content ?? null,
    error: body.error ?? null,
    metadata: body.success && body.feature ? { feature: body.feature, model } : null,
    durationMs: Date.now() - start,
  });
}

export default async function handler(req, res) {
  const start = Date.now();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    respond(res, 405, { success: false, error: "Method not allowed" }, start);
    return;
  }

  const { feature, context } = req.body || {};
  const featureConfig = Object.prototype.hasOwnProperty.call(FEATURES, feature) ? FEATURES[feature] : null;
  if (!featureConfig) {
    respond(res, 400, { success: false, error: SAFE_ERRORS.badRequest }, start);
    return;
  }

  // Bound the size of what is sent on to a provider.
  const safeContext = context && typeof context === "object" ? context : {};
  if (JSON.stringify(safeContext).length > MAX_CONTEXT_CHARS) {
    respond(res, 413, { success: false, error: SAFE_ERRORS.badRequest, feature }, start);
    return;
  }

  const fullPrompt = `${EDITORIAL_SYSTEM_PROMPT}\n\n---\n\n${featureConfig.build(safeContext)}`;

  // Gemini first. If it fails and an Anthropic key is configured, fall back to it.
  const providers = [["gemini", GEMINI_MODEL, () => generateWithGemini(fullPrompt, featureConfig.maxTokens)]];
  if (anthropicConfigured()) {
    providers.push(["anthropic", process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001", () => generateWithAnthropic(fullPrompt, featureConfig.maxTokens)]);
  }

  let lastStatus;
  for (const [name, model, run] of providers) {
    try {
      const content = await run();
      respond(res, 200, { success: true, content, feature }, start, model);
      return;
    } catch (err) {
      lastStatus = err.status;
      // Safe diagnostic: provider name, feature and status code only.
      console.warn(`[ai] ${name} failed for "${feature}"`, { status: err.status ?? "none" });
    }
  }

  const busy = lastStatus === 429;
  respond(res, busy ? 429 : 502, { success: false, error: busy ? SAFE_ERRORS.busy : SAFE_ERRORS.unavailable, feature }, start);
}
