// Ambient sound for the opening page: a cold wind moving along a winter
// street. It is generated live with the Web Audio API, so there is no audio
// file to license or download, and nothing plays until the person taps.
//
// Rules this follows:
// - Always starts silent. Browsers block autoplay anyway, and unexpected
//   sound is the quickest way to lose someone.
// - The first sound only starts from a tap (so the audio context is allowed).
// - Mute and pause are separate controls.
// - It fades down while the spoken story ("Listen") is playing.
// - It goes quiet when the tab is hidden and stops when the page is left.

type State = { muted: boolean; paused: boolean };

const BASE_LEVEL = 0.16; // overall loudness, kept low on purpose
const DUCKED_LEVEL = 0.2; // share of the level kept while the voice speaks

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sources: AudioScheduledSourceNode[] = [];
let state: State = { muted: true, paused: false };
let ducked = false;
let hidden = false;
let suspendTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function getState(): State {
  return state;
}

// Brown noise with a short crossfade at the loop point, so the loop has no click.
function makeNoise(c: AudioContext, seconds: number): AudioBuffer {
  const fade = Math.floor(c.sampleRate * 0.5);
  const length = Math.floor(c.sampleRate * seconds);
  const raw = new Float32Array(length + fade);
  let last = 0;
  for (let i = 0; i < raw.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    raw[i] = last * 3.5;
  }
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const out = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) out[i] = raw[i];
  for (let i = 0; i < fade; i++) {
    const t = i / fade;
    out[i] = out[i] * Math.sin((t * Math.PI) / 2) + raw[length + i] * Math.cos((t * Math.PI) / 2);
  }
  return buffer;
}

function build(c: AudioContext) {
  master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);

  const noise = makeNoise(c, 12);

  // Low body of the wind, with slow gusts in both pitch and loudness.
  const bodySrc = c.createBufferSource();
  bodySrc.buffer = noise;
  bodySrc.loop = true;
  const body = c.createBiquadFilter();
  body.type = "bandpass";
  body.frequency.value = 380;
  body.Q.value = 0.5;
  const bodyGain = c.createGain();
  bodyGain.gain.value = 0.9;
  const sweep = c.createOscillator();
  sweep.frequency.value = 0.06;
  const sweepDepth = c.createGain();
  sweepDepth.gain.value = 170;
  sweep.connect(sweepDepth).connect(body.frequency);
  const gust = c.createOscillator();
  gust.frequency.value = 0.045;
  const gustDepth = c.createGain();
  gustDepth.gain.value = 0.35;
  gust.connect(gustDepth).connect(bodyGain.gain);
  bodySrc.connect(body).connect(bodyGain).connect(master);

  // Thin, airy top layer, like wind catching cold air between buildings.
  const airSrc = c.createBufferSource();
  airSrc.buffer = noise;
  airSrc.loop = true;
  airSrc.loopStart = 3;
  const air = c.createBiquadFilter();
  air.type = "highpass";
  air.frequency.value = 2200;
  const airGain = c.createGain();
  airGain.gain.value = 0.05;
  const airGust = c.createOscillator();
  airGust.frequency.value = 0.08;
  const airDepth = c.createGain();
  airDepth.gain.value = 0.035;
  airGust.connect(airDepth).connect(airGain.gain);
  airSrc.connect(air).connect(airGain).connect(master);

  sources = [bodySrc, sweep, gust, airSrc, airGust];
  sources.forEach((s) => s.start());
}

function targetLevel(): number {
  if (state.muted || state.paused || hidden) return 0;
  return ducked ? BASE_LEVEL * DUCKED_LEVEL : BASE_LEVEL;
}

function apply() {
  if (!ctx || !master) return;
  const target = targetLevel();
  if (suspendTimer) { clearTimeout(suspendTimer); suspendTimer = null; }
  if (target > 0) {
    void ctx.resume();
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.6);
  } else {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    // Stop using the processor once the fade has finished.
    suspendTimer = setTimeout(() => {
      if (ctx && targetLevel() === 0) void ctx.suspend();
    }, 2200);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    apply();
  });
}

/** Turn sound on or off. Must be called from a tap the first time. */
export function setMuted(muted: boolean) {
  if (!muted && !ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    build(ctx);
  }
  state.muted = muted;
  if (!muted) state.paused = false;
  emit();
  apply();
}

export function setPaused(paused: boolean) {
  state.paused = paused;
  emit();
  apply();
}

/** Lower the ambient sound while the spoken story plays, and bring it back after. */
export function duck(on: boolean) {
  ducked = on;
  apply();
}

/** Fade out and release everything. Called when the page is left. */
export function stop() {
  if (!ctx) { state = { muted: true, paused: false }; emit(); return; }
  const c = ctx;
  const m = master;
  ctx = null;
  master = null;
  if (suspendTimer) { clearTimeout(suspendTimer); suspendTimer = null; }
  if (m) m.gain.setTargetAtTime(0, c.currentTime, 0.2);
  setTimeout(() => {
    sources.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    sources = [];
    void c.close();
  }, 1200);
  state = { muted: true, paused: false };
  emit();
}
