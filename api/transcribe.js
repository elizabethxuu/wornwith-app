// Vercel serverless function for transcribing a recorded voice note via
// ElevenLabs' Speech-to-Text (Scribe) API.
//
// Same pattern as api/voice.js: this already speaks ElevenLabs' real
// transcription API, not a placeholder. It's inactive until
// ELEVENLABS_API_KEY is set in Vercel's Environment Variables. Without a
// key, the frontend still saves and plays back the recorded audio just
// fine — a transcript is an enhancement, not a requirement, so this fails
// gracefully rather than blocking the core recording feature.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { audioBase64, mimeType } = req.body || {};
  if (!audioBase64 || typeof audioBase64 !== "string") {
    res.status(400).json({ error: "Missing audioBase64" });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(501).json({ error: "Transcription not configured" });
    return;
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const blob = new Blob([audioBuffer], { type: mimeType || "audio/webm" });

    const form = new FormData();
    form.append("file", blob, "note.webm");
    form.append("model_id", "scribe_v1");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(502).json({ error: "Transcription failed", detail });
      return;
    }

    const data = await response.json();
    res.status(200).json({ text: data.text || "" });
  } catch (err) {
    res.status(500).json({ error: "Transcription failed" });
  }
}
