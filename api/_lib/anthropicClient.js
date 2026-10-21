// Optional fallback provider, used only when ANTHROPIC_API_KEY is configured
// (it is already listed in .env.example). If the variable is not set this
// provider is skipped and nothing is charged.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
const TIMEOUT_MS = 12000;

export function anthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateWithAnthropic(fullPrompt, maxTokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("Anthropic is not configured");
    err.status = 501;
    throw err;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: Math.max(maxTokens, 200),
      messages: [{ role: "user", content: fullPrompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const err = new Error(`Anthropic returned HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json().catch(() => null);
  const text = (data?.content ?? [])
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("")
    .trim();
  if (!text) {
    const err = new Error("Anthropic returned no text");
    throw err;
  }
  return text;
}
