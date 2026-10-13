import { EDITORIAL_SYSTEM_PROMPT } from "./_lib/editorialVoice.js";
import { FEATURES } from "./_lib/prompts.js";
import { generateWithGemini, GEMINI_MODEL } from "./_lib/geminiClient.js";

function respond(res, status, body, start) {
  const payload = {
    success: body.success,
    content: body.content ?? null,
    error: body.error ?? null,
    metadata: body.feature ? { feature: body.feature, model: GEMINI_MODEL } : null,
    durationMs: Date.now() - start,
  };
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

  if (process.env.NODE_ENV !== "production") console.info("[ai] request received", { feature });

  const fullPrompt = `${EDITORIAL_SYSTEM_PROMPT}\n\n---\n\n${featureConfig.build(context || {})}`;

  try {
    const content = await generateWithGemini(fullPrompt, featureConfig.maxTokens);
    respond(res, 200, { success: true, content, feature }, start);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ai] generation failed", { feature, status: err.status || 502, message: err.message });
    }
    const status = err.status === 400 ? 400 : err.status === 429 ? 429 : 502;
    respond(res, status, { success: false, error: "Reflection is temporarily unavailable. Please try again.", feature }, start);
  }
}
