// Tiny Web Audio sound engine (FR-CHAR-034). Off by default and never
// autoplays: browsers only allow audio after a user gesture, and we only create
// the AudioContext once the visitor turns sound on. Cues are synthesised (no
// audio files to host or commission), tuned to soft gold bell tones so they read
// as a touch of magic, not notification spam. Every entry point is a no-op on
// the server and while sound is off.

export const SOUND_CHANGED_EVENT = "cs:sound:changed";
const STORAGE_KEY = "cs-sound";

type Cue = "open" | "grant" | "greet" | "toggle";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let hydrated = false;

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

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5; // keep the whole layer gentle
    master.connect(ctx.destination);
  }
  return ctx;
}

// One bell-like partial: a fast attack into an exponential decay, routed through
// the shared master gain.
function note(freq: number, at: number, dur: number, peak: number, type: OscillatorType = "sine"): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + at;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function play(cue: Cue): void {
  hydrate();
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  switch (cue) {
    case "open": // chat opens: a soft rising shimmer
      note(880, 0, 0.45, 0.1);
      note(1320, 0.05, 0.5, 0.055);
      break;
    case "greet": // Lumi waves at the contact section
      note(659.25, 0, 0.5, 0.09);
      note(987.77, 0.05, 0.55, 0.05);
      break;
    case "grant": // wish granted: a celebratory major chime
      note(659.25, 0, 1.05, 0.1); // E5
      note(830.61, 0.05, 1.05, 0.075); // G#5
      note(987.77, 0.1, 1.1, 0.06); // B5
      note(1318.5, 0.16, 1.15, 0.045); // E6 sparkle
      break;
    case "toggle": // confirmation blip when sound is switched on
      note(1046.5, 0, 0.2, 0.07);
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
    // resume) audio; confirm with a blip.
    const c = getCtx();
    if (c && c.state === "suspended") void c.resume();
    play("toggle");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SOUND_CHANGED_EVENT, { detail: { on } }));
  }
}
