// Tiny Web Audio sound engine (FR-CHAR-034). Off by default and never
// autoplays: browsers only allow audio after a user gesture, and we only create
// the AudioContext once the visitor turns sound on. Cues are synthesised (no
// audio files to host or commission) as additive bells - a fundamental plus a
// detuned near-octave, a fifth, and a stretched upper partial - with click-free
// envelopes, gentle stereo width, a soft high cut, and a subtle reverb tail, so
// they read as warm gold chimes, not notification beeps. Every entry point is a
// no-op on the server and while sound is off.

export const SOUND_CHANGED_EVENT = "cs:sound:changed";
const STORAGE_KEY = "cs-sound";

type Cue = "open" | "grant" | "greet" | "toggle" | "hover" | "easterEgg";

let ctx: AudioContext | null = null;
let bus: GainNode | null = null; // notes connect here (dry); also feeds reverb
let enabled = false;
let hydrated = false;

// Bell timbre: partial ratios, relative levels, and how long each partial rings
// as a fraction of the note length. The 2.005 octave is detuned a hair so the
// two beat gently (shimmer); the 4.2 is stretched for a little glitter.
const PARTIALS: { ratio: number; gain: number; decay: number }[] = [
  { ratio: 1.0, gain: 1.0, decay: 1.0 },
  { ratio: 2.005, gain: 0.5, decay: 0.7 },
  { ratio: 3.0, gain: 0.26, decay: 0.5 },
  { ratio: 4.2, gain: 0.12, decay: 0.34 },
];

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    enabled = false;
  }
}

export function isSoundOn(): boolean {
  hydrate();
  return enabled;
}

// Exponentially decaying stereo noise - a cheap, natural-sounding reverb impulse.
function makeImpulse(c: AudioContext, seconds = 1.7, decay = 3.4): AudioBuffer {
  const len = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    const master = ctx.createGain();
    master.gain.value = 1.1; // calibrated so cues peak around -12 dBFS: present, not jarring
    // Soft high cut takes any digital edge off the bells.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 7600;
    lp.Q.value = 0.4;
    master.connect(lp).connect(ctx.destination);

    bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(master);
    // Subtle hall tail (skipped gracefully if ConvolverNode is unavailable).
    try {
      const reverb = ctx.createConvolver();
      reverb.buffer = makeImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.16;
      bus.connect(reverb).connect(wet).connect(master);
    } catch {
      // dry only
    }
  }
  return ctx;
}

// One additive bell strike at `freq`, starting `at` seconds from now, ringing
// for ~`dur`, at level `peak`, panned `pan` (-1..1).
function bell(freq: number, at: number, dur: number, peak: number, pan = 0): void {
  if (!ctx || !bus) return;
  const t0 = ctx.currentTime + at;
  let dest: AudioNode = bus;
  if (ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(bus);
    dest = panner;
  }
  for (const pr of PARTIALS) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * pr.ratio;
    const g = ctx.createGain();
    const a = peak * pr.gain;
    const end = Math.max(0.06, dur * pr.decay);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(a, t0 + 0.006); // click-free attack
    g.gain.exponentialRampToValueAtTime(Math.max(a * 0.001, 0.00008), t0 + end); // bell decay
    g.gain.linearRampToValueAtTime(0, t0 + end + 0.03); // release to true zero
    osc.connect(g).connect(dest);
    osc.start(t0);
    osc.stop(t0 + end + 0.06);
  }
}

export function play(cue: Cue): void {
  hydrate();
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  switch (cue) {
    case "open": // chat opens: a soft two-note rise
      bell(587.33, 0, 0.9, 0.16, -0.12); // D5
      bell(880.0, 0.09, 1.1, 0.12, 0.12); // A5
      break;
    case "greet": // Lumi waves: a friendly little arpeggio up
      bell(523.25, 0, 0.8, 0.14, -0.15); // C5
      bell(659.25, 0.08, 0.9, 0.12, 0.0); // E5
      bell(783.99, 0.16, 1.1, 0.1, 0.15); // G5
      break;
    case "grant": // wish granted: a warm major add9, gently arpeggiated, longer tail
      bell(523.25, 0, 1.8, 0.15, -0.18); // C5
      bell(659.25, 0.06, 1.9, 0.12, -0.05); // E5
      bell(783.99, 0.12, 2.0, 0.11, 0.08); // G5
      bell(987.77, 0.2, 2.2, 0.09, 0.18); // B5
      bell(1174.66, 0.28, 2.2, 0.06, 0.0); // D6 sparkle (the add9)
      break;
    case "hover": // soft blip on hover
      bell(880.0, 0, 0.2, 0.05, 0);
      break;
    case "easterEgg": // magic chord for the easter egg
      bell(523.25, 0, 2.0, 0.15, -0.2); // C5
      bell(659.25, 0.1, 2.0, 0.15, 0.2); // E5
      bell(783.99, 0.2, 2.0, 0.15, 0); // G5
      bell(1046.50, 0.3, 2.5, 0.2, 0); // C6
      break;
    case "toggle": // confirmation when sound is switched on: a single soft blip
      bell(880.0, 0, 0.5, 0.18, 0);
      break;
  }
}

export function setSoundOn(on: boolean): void {
  hydrate();
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // ignore storage failures (private mode)
  }
  if (on) {
    // The click that turns sound on is the user gesture that lets us start (and
    // resume) audio; confirm with a soft blip.
    const c = getCtx();
    if (c && c.state === "suspended") void c.resume();
    play("toggle");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SOUND_CHANGED_EVENT, { detail: { on } }));
  }
}
