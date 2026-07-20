// Vercel serverless function — runs server-side, so no API key ever
// reaches the browser.
//
// Tries GEMINI_API_KEY first (Google AI Studio has a genuinely free tier,
// no credit card required — aistudio.google.com). Falls back to
// ANTHROPIC_API_KEY if that's what you've got configured instead. You only
// need to set ONE of these, not both.

const PROMPT_FOR = (text) =>
  `Someone just wrote this about when they imagine wearing a coat they own: "${text.slice(0, 300)}"\n\nWrite exactly one short, warm sentence (under 18 words) reflecting back this specific moment — like a thoughtful friend noticing something true about it, not a marketer. No quotation marks, no preamble, no emoji.`;

async function tryGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT_FOR(text) }] }],
        generationConfig: { maxOutputTokens: 60 },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini error: ${detail}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
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
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic error: ${detail}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Missing text" });
    return;
  }

  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "AI summary isn't configured yet" });
    return;
  }

  try {
    const summary = (await tryGemini(text)) ?? (await tryAnthropic(text));
    res.status(200).json({ summary: summary || "" });
  } catch (err) {
    res.status(502).json({ error: "Generation failed", detail: String(err) });
  }
}
