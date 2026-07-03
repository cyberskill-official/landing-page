// Shared mascot state (FR-CHAR-030): plain module-level stores, in the same
// spirit as lib/scroll/progress.ts - written by the 3D scene each frame and
// read by DOM components (and vice versa) with no React re-renders and no
// three.js imports, so DOM consumers (LumiHotspot, LeadForm) never pull the
// 3D chunk into their bundles.

// Where Lumi currently sits on screen, in CSS pixels, written by the scene's
// projection every frame. The DOM hotspot rides on it, which is what turns
// Lumi from a decoration into the site's living chat entry.
export type LumiScreen = {
  x: number;
  y: number;
  r: number;
  visible: boolean;
};

let screen: LumiScreen = { x: 0, y: 0, r: 0, visible: false };

export function setLumiScreen(next: LumiScreen): void {
  screen = next;
}

export function getLumiScreen(): LumiScreen {
  return screen;
}

// Pointer excitement: true while the visitor hovers Lumi's hotspot. The scene
// reads it to speed the idle bob and pop a sparkle burst.
let excite = false;

export function setLumiExcite(value: boolean): void {
  excite = value;
}

export function getLumiExcite(): boolean {
  return excite;
}

// Normalized pointer position (-1..1, r3f convention: +y up), fed by a window
// listener in GenieScene. The scene reads THIS instead of r3f's own
// state.pointer because the canvas element must stay pointer-inert: r3f's
// event system gives its canvas pointer-events, and with the live layer
// riding above the content that silently swallowed every click on the page.
export type PointerNorm = { x: number; y: number };

let pointerNorm: PointerNorm = { x: 0, y: 0 };

export function setPointerNorm(next: PointerNorm): void {
  pointerNorm = next;
}

export function getPointerNorm(): PointerNorm {
  return pointerNorm;
}

// Lumi's current world position (z=0 plane), written by the rig each frame so
// the burst field can spawn magic exactly where the mascot is.
export type LumiWorld = { x: number; y: number; z: number };

let world: LumiWorld = { x: 1.4, y: 0, z: 0 };

export function setLumiWorld(next: LumiWorld): void {
  world = next;
}

export function getLumiWorld(): LumiWorld {
  return world;
}

// Magic-burst requests from the DOM world (form success, hotspot clicks).
// The scene drains this queue each frame; power scales the burst.
export type BurstRequest = { power: number };

const burstQueue: BurstRequest[] = [];

export function requestBurst(power = 1): void {
  // Cap the queue so a stuck consumer can never grow it unbounded.
  if (burstQueue.length < 8) burstQueue.push({ power });
}

export function drainBursts(): BurstRequest[] {
  return burstQueue.splice(0, burstQueue.length);
}

// How strongly Lumi should "present" the act at screen centre (0..1), written
// by SceneFocus from the centred act's focus and read by the rig, which turns
// Lumi a touch toward the page while an act is held and relaxes it between acts.
// Plain scalar, no three import - the same DOM<->scene bridge as the rest here.
let attend = 0;

export function setAttend(value: number): void {
  attend = value < 0 ? 0 : value > 1 ? 1 : value;
}

export function getAttend(): number {
  return attend;
}

// Fired by LeadForm on a successful submission ("the wish is granted"); the
// scene listens and celebrates.
export const WISH_GRANTED_EVENT = "cs:wish-granted";

// Fired when Lumi plays its welcome wave as the contact section arrives; the
// sound layer listens so the greet has a chime when sound is on.
export const LUMI_GREET_EVENT = "cs:lumi:greet";

// Black-hole digest progress (FR-CHAR-032): 0 = page intact, 1 = fully
// devoured. Written by the DOM digest manager (press-and-hold), read by the
// scene (Lumi darkens into a gold-rimmed hole) and by anything else that
// wants to react.
let digest = 0;

export function setDigest(value: number): void {
  digest = value < 0 ? 0 : value > 1 ? 1 : value;
}

export function getDigest(): number {
  return digest;
}
