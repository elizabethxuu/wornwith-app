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
