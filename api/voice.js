// Vercel serverless function for premium AI voice narration.
//
// This is the real integration point, not a placeholder to be rewritten
// later — it already speaks ElevenLabs' actual API. It's simply inactive
// until an ELEVENLABS_API_KEY is added in Vercel's Environment Variables
// (Settings → Environment Variables), same pattern as the Gemini/Anthropic
// key for AI reflections. No frontend changes are needed when you add it.

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

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(501).json({ error: "Premium voice not configured" });
    return;
  }

  // A calm, neutral default voice (ElevenLabs' "Rachel"). Override with
  // ELEVENLABS_VOICE_ID in Vercel if you pick a different one from your
  // ElevenLabs voice library.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 500),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: "Voice synthesis failed", detail });
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(Buffer.from(audioBuffer));
  } catch (err) {
    res.status(500).json({ error: "Voice synthesis failed" });
  }
}
