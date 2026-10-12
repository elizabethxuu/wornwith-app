// Vercel serverless function for the AI Reflection feature.
// API credentials stay on the server and must be configured in Vercel.

const PROMPT_FOR = (text) =>
  `Someone wrote this about imagining wearing a coat they own: "${text.slice(0, 300)}"

Write exactly one short, warm sentence under 18 words. Reflect this specific moment like a thoughtful friend, not a marketer. No quotation marks, preamble, or emoji.`;

const REQUEST_TIMEOUT_MS = 10000;

async function tryGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT_FOR(text) }] }],
        generationConfig: { maxOutputTokens: 60 },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function tryAnthropic(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      messages: [{ role: "user", content: PROMPT_FOR(text) }],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Anthropic returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Missing text" });
    return;
  }

  const input = text.trim();
  if (input.length > 2000) {
    res.status(413).json({ error: "Text is too long" });
    return;
  }

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "AI summary isn't configured yet" });
    return;
  }

  const providers = [
    ["Gemini", () => tryGemini(input)],
    ["Anthropic", () => tryAnthropic(input)],
  ];

  for (const [provider, generate] of providers) {
    try {
      const summary = await generate();
      if (typeof summary === "string" && summary.trim()) {
        res.status(200).json({ summary: summary.trim() });
        return;
      }
    } catch (error) {
      // Keep provider details out of the public response. Server logs retain
      // only the provider name and a short error message for troubleshooting.
      console.error(`AI Reflection provider failed: ${provider}`, error?.message || "Unknown error");
    }
  }

  res.status(502).json({ error: "AI Reflection could not generate a response. Please try again." });
}
