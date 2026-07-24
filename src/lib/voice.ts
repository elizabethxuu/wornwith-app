// The UI never needs to know which voice is actually speaking. It calls
// speak(text) and gets back one of three outcomes. When a premium provider
// is configured server-side (see api/voice.js), this starts returning
// "premium" automatically — no UI changes required.

export type VoiceResult =
  | { mode: "premium"; audioUrl: string }
  | { mode: "browser" }
  | { mode: "unavailable" };

export async function requestVoice(text: string): Promise<VoiceResult> {
  try {
    const res = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const blob = await res.blob();
      return { mode: "premium", audioUrl: URL.createObjectURL(blob) };
    }
  } catch {
    // network/endpoint issue — fall through to the dev-only fallback below
  }

  // No premium voice configured. The browser's built-in speech synthesis
  // is a real, working fallback — genuinely enabled everywhere now
  // (previously gated to development only, which meant "Listen" never
  // worked on the live site at all). Premium still takes over
  // automatically the moment ELEVENLABS_API_KEY is configured, with zero
  // changes needed here.
  if ("speechSynthesis" in window) {
    return { mode: "browser" };
  }

  return { mode: "unavailable" };
}

// Sends a recorded voice note to ElevenLabs Speech-to-Text (see
// api/transcribe.js). Returns the transcript, or null if transcription
// isn't configured/available — the caller should treat that as "no
// transcript," not an error, since the audio itself is already saved and
// playable regardless of whether a transcript comes back.
export async function transcribeVoiceNote(audioBase64: string, mimeType: string): Promise<string | null> {
  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.text === "string" && data.text.trim() ? data.text.trim() : null;
  } catch {
    return null;
  }
}
