// One declarative map from story progress to scene state (FR-SCENE-007). Every
// scene consumer - the camera rig, Lumi's choreography, and the lighting - reads
// targets from here instead of computing its own, so there is a single source of
// truth. Input is the normalized 0..1 progress from the shared scroll loop
// (FR-SCENE-002); it is always clamped. With motion disabled the same map still
// resolves to a stable static state (clause 4), which the non-WebGL StaticPoster
// path mirrors.

export type SceneState = {
  camera: { x: number; y: number; z: number; fov: number };
  model: { spin: number; driftX: number; driftZ: number; glow: number };
  light: { intensity: number };
};

// Declarative keyframe stops along the story timeline. Edit these, not the
// components, to retune the choreography.
const STOPS: ReadonlyArray<{ at: number; state: SceneState }> = [
  {
    at: 0,
    state: {
      camera: { x: 0, y: 0, z: 4, fov: 45 },
      model: { spin: 0, driftX: 0, driftZ: 0, glow: 0 },
      light: { intensity: 1.8 },
    },
  },
  {
    at: 0.5,
    state: {
      camera: { x: -0.25, y: 0.18, z: 3.55, fov: 42.5 },
      model: { spin: 0.25, driftX: 0.25, driftZ: 0.3, glow: 0.5 },
      light: { intensity: 2.4 },
    },
  },
  {
    at: 1,
    state: {
      camera: { x: -0.5, y: 0.35, z: 3.1, fov: 40 },
      model: { spin: -0.1, driftX: 0.5, driftZ: 0.6, glow: 1 },
      light: { intensity: 3 },
    },
  },
];

export function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blend(a: SceneState, b: SceneState, t: number): SceneState {
  return {
    camera: {
      x: lerp(a.camera.x, b.camera.x, t),
      y: lerp(a.camera.y, b.camera.y, t),
      z: lerp(a.camera.z, b.camera.z, t),
      fov: lerp(a.camera.fov, b.camera.fov, t),
    },
    model: {
      spin: lerp(a.model.spin, b.model.spin, t),
      driftX: lerp(a.model.driftX, b.model.driftX, t),
      driftZ: lerp(a.model.driftZ, b.model.driftZ, t),
      glow: lerp(a.model.glow, b.model.glow, t),
    },
    light: { intensity: lerp(a.light.intensity, b.light.intensity, t) },
  };
}

// Resolve scene state at a story progress in 0..1 (clamped). Lerps between the
// two surrounding declarative stops.
export function resolveSceneState(progress: number): SceneState {
  const p = clamp01(progress);
  for (let i = 0; i < STOPS.length - 1; i++) {
    const lo = STOPS[i];
    const hi = STOPS[i + 1];
    if (p >= lo.at && p <= hi.at) {
      const span = hi.at - lo.at || 1;
      const rt = (p - lo.at) / span;
      // Ease each transition (smoothstep) so spin / drift / camera glide between
      // stops instead of tracking raw scroll linearly - a smoother flight feel.
      return blend(lo.state, hi.state, rt * rt * (3 - 2 * rt));
    }
  }
  return STOPS[STOPS.length - 1].state;
}

// Stable static state for the reduced-motion / non-WebGL path (clause 4): the
// opening composition, so the scene composes correctly without animation.
export function staticSceneState(): SceneState {
  return resolveSceneState(0);
}
