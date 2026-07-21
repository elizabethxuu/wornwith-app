// The one function every AI-powered UI element calls. Handles the parts
// that used to be missing entirely: a real timeout (so a stalled request
// can't leave a "Generating…" state hanging forever), and de-duplication
// (so double-clicking a "Generate" button, or two components asking for
// the same thing at once, doesn't fire two identical requests).

export type AIFeature =
  | "reflection"
  | "curatorsNotes"
  | "archiveSummary"
  | "story"
  | "todaysEdit"
  | "environmentalPerformance";

export type AIResponse = {
  success: boolean;
  content: string | null;
  error: string | null;
  metadata: { feature: string; model: string } | null;
  durationMs: number;
};

const TIMEOUT_MS = 15000;

// Requests currently in flight, keyed by feature+context, so an identical
// request already running is reused instead of duplicated.
const inFlight = new Map<string, Promise<AIResponse>>();

export function generateAI(feature: AIFeature, context: Record<string, unknown>): Promise<AIResponse> {
  const key = feature + JSON.stringify(context);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<AIResponse> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, context }),
        signal: controller.signal,
      });
      const data = await res.json();
      return data as AIResponse;
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      return {
        success: false,
        content: null,
        error: timedOut ? "Request timed out" : "Network error",
        metadata: null,
        durationMs: TIMEOUT_MS,
      };
    } finally {
      clearTimeout(timeout);
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}
