// Vercel serverless function — runs server-side, so the API key never
// reaches the browser. Deploys automatically since Vercel picks up any
// file under /api regardless of frontend framework.
//
// Requires an ANTHROPIC_API_KEY environment variable set in your Vercel
// project (Settings → Environment Variables). Without it, this returns a
// clear error instead of silently failing or faking a response.

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI summary isn't configured yet" });
    return;
  }

  try {
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
        messages: [
          {
            role: "user",
            content: `Someone just wrote this about when they imagine wearing a coat they own: "${text.slice(0, 300)}"\n\nWrite exactly one short, warm sentence (under 18 words) reflecting back this specific moment — like a thoughtful friend noticing something true about it, not a marketer. No quotation marks, no preamble, no emoji.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(502).json({ error: "Generation failed", detail: errText });
      return;
    }

    const data = await response.json();
    const summary = data?.content?.[0]?.text?.trim() || "";
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
}
