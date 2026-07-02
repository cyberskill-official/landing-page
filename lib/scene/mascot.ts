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

// Fired by LeadForm on a successful submission ("the wish is granted"); the
// scene listens and celebrates.
export const WISH_GRANTED_EVENT = "cs:wish-granted";
