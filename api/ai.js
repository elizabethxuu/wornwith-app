import { EDITORIAL_SYSTEM_PROMPT } from "./_lib/editorialVoice.js";
import { FEATURES } from "./_lib/prompts.js";
import { generateWithGemini } from "./_lib/geminiClient.js";

const isProd = process.env.VERCEL_ENV === "production";

// Every response from this endpoint follows the same shape, whether it
// succeeds or fails — the frontend never has to guess what fields exist.
function respond(res, status, { success, content = null, error = null, feature = null }, start) {
  res.status(status).json({
    success,
    content,
    error,
    metadata: feature ? { feature, model: "gemini-2.0-flash" } : null,
    durationMs: Date.now() - start,
  });
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

  if (!isProd) {
    console.log("[ai] request received", { feature });
  }

  const fullPrompt = `${EDITORIAL_SYSTEM_PROMPT}\n\n---\n\n${featureConfig.build(context || {})}`;

  try {
    const content = await generateWithGemini(fullPrompt, featureConfig.maxTokens);
    respond(res, 200, { success: true, content, feature }, start);
  } catch (err) {
    respond(res, err.status === 429 ? 429 : 502, { success: false, error: err.message || "Generation failed", feature }, start);
  }
}
