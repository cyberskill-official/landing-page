import { describe, it, expect } from "vitest";
import { resolveSceneState, staticSceneState, clamp01 } from "@/lib/scene/progressMap";

describe("scene progress map (FR-SCENE-007)", () => {
  it("clamps progress input to 0..1", () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(5)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(Number.NaN)).toBe(0);
  });

  it("resolves a clamped state at and beyond the ends", () => {
    const start = resolveSceneState(-1);
    expect(start.camera.z).toBeCloseTo(4);
    expect(start.model.glow).toBeCloseTo(0);
    const end = resolveSceneState(2);
    expect(end.camera.z).toBeCloseTo(3.1);
    expect(end.model.glow).toBeCloseTo(1);
  });

  it("interpolates monotonically between stops", () => {
    const mid = resolveSceneState(0.5);
    expect(mid.camera.z).toBeLessThan(4);
    expect(mid.camera.z).toBeGreaterThan(3.1);
    expect(mid.model.glow).toBeGreaterThan(0);
    expect(mid.model.glow).toBeLessThan(1);
    // Camera pushes in as the story advances.
    expect(resolveSceneState(0.25).camera.z).toBeGreaterThan(resolveSceneState(0.75).camera.z);
  });

  it("exposes a stable static state for the reduced-motion path", () => {
    expect(staticSceneState()).toEqual(resolveSceneState(0));
  });
});
