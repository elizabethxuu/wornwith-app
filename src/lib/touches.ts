// Small physical touches. Both are best-effort and silent when unsupported.
// Vibration: Android through the Vibration API. iPhone Safari has no such
// API, but since iOS 18 toggling a native switch control plays the system
// haptic tick, so on iPhone a hidden switch is flipped instead. The paper
// sound is synthesized with Web Audio, so there's no file to load.

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function iosTick() {
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.display = "none";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);
  document.head.appendChild(label);
  label.click();
  document.head.removeChild(label);
}

export function haptic(ms = 12) {
  try {
    if (typeof navigator === "undefined") return;
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    } else if (isIOS()) {
      iosTick();
    }
  } catch {
    /* unsupported */
  }
}

let ctx: AudioContext | null = null;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// A soft page turn: a short burst of filtered noise that sweeps down, quiet
// enough to sit under the ambient sound. Only plays after a tap (browsers
// require a gesture before audio), which is always how a page is turned.
export function paperSound() {
  if (typeof window === "undefined" || reducedMotion()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const dur = 0.32;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;
    const now = ctx.currentTime;
    band.frequency.setValueAtTime(3200, now);
    band.frequency.exponentialRampToValueAtTime(900, now + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  } catch {
    /* audio unavailable */
  }
}
