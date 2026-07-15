import { describe, it, expect } from "vitest";
import {
  buildStops,
  clamp,
  CHAT_CENTER,
  CHAT_ORBIT,
  sampleChatOrbit,
  sampleJourney,
  smoothstep,
  viewportToWorld,
  type JourneyStop,
} from "@/lib/scene/journey";

// Lumi's flight-plan math (TASK-CHAR-030). Pure functions - the scene only adds
// easing and bursts on top, so pinning these down pins the mascot's behaviour.

const stops: JourneyStop[] = [
  { y: 0, vx: 0.72, vy: 0.44, scale: 1 },
  { y: 1000, vx: 0.1, vy: 0.4, scale: 0.4 },
  { y: 2000, vx: 0.9, vy: 0.3, scale: 0.5 },
];

describe("sampleJourney", () => {
  it("holds the first anchor before the journey starts", () => {
    const s = sampleJourney(stops, -50);
    expect(s.vx).toBe(0.72);
    expect(s.scale).toBe(1);
    expect(s.seg).toBe(0);
  });

  it("holds the last anchor past the end", () => {
    const s = sampleJourney(stops, 99999);
    expect(s.vx).toBe(0.9);
    expect(s.t).toBe(1);
  });

  it("hits the midpoint of a leg at its smoothstep centre", () => {
    const s = sampleJourney(stops, 500);
    expect(s.seg).toBe(0);
    expect(s.t).toBeCloseTo(0.5);
    expect(s.vx).toBeCloseTo((0.72 + 0.1) / 2);
    expect(s.scale).toBeCloseTo(0.7);
  });

  it("is monotonic along a leg (no backtracking)", () => {
    let prev = sampleJourney(stops, 1000).vx;
    for (let y = 1050; y <= 2000; y += 50) {
      const next = sampleJourney(stops, y).vx;
      expect(next).toBeGreaterThanOrEqual(prev);
      prev = next;
    }
  });

  it("survives an empty route with the hero anchor", () => {
    const s = sampleJourney([], 500);
    expect(s.vx).toBeCloseTo(0.72);
    expect(s.scale).toBe(1);
  });
});

describe("buildStops", () => {
  it("centres stops on sections, clamps into the scrollable range, and sorts", () => {
    const built = buildStops(
      [
        { anchor: { vx: 0.5, vy: 0.5, scale: 1 }, top: 5000, height: 400 },
        { anchor: { vx: 0.2, vy: 0.4, scale: 0.5 }, top: 0, height: 800 },
      ],
      800,
      3000,
    );
    expect(built[0].y).toBe(0); // 0 + 400 - 400 = 0
    expect(built[0].vx).toBe(0.2);
    expect(built[1].y).toBe(3000); // 5200 - 400 clamped to scrollMax
    expect(built[1].vx).toBe(0.5);
  });
});

describe("viewportToWorld", () => {
  const Z = 4;
  const FOV = 45;
  const halfH = Math.tan((FOV * Math.PI) / 360) * Z;

  it("maps the viewport centre to the world origin", () => {
    const w = viewportToWorld(0.5, 0.5, Z, FOV, 1.6);
    expect(w.x).toBeCloseTo(0);
    expect(w.y).toBeCloseTo(0);
  });

  it("maps edges to the frustum bounds at z=0", () => {
    const aspect = 1.6;
    expect(viewportToWorld(1, 0.5, Z, FOV, aspect).x).toBeCloseTo(halfH * aspect);
    expect(viewportToWorld(0, 0.5, Z, FOV, aspect).x).toBeCloseTo(-halfH * aspect);
    expect(viewportToWorld(0.5, 0, Z, FOV, aspect).y).toBeCloseTo(halfH);
    expect(viewportToWorld(0.5, 1, Z, FOV, aspect).y).toBeCloseTo(-halfH);
  });
});

describe("helpers", () => {
  it("smoothstep clamps and eases", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(2)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5);
    expect(smoothstep(0.25)).toBeLessThan(0.25); // ease-in at the start
  });

  it("clamp bounds values", () => {
    expect(clamp(5, 0, 2)).toBe(2);
    expect(clamp(-5, 0, 2)).toBe(0);
  });
});

// Chat-open flight: big 3D Lumi orbits the cloud centre (not a fixed hold).
describe("sampleChatOrbit", () => {
  it("stays on an ellipse around CHAT_CENTER with the configured radii", () => {
    const s = sampleChatOrbit(0);
    // cos(0)=1, sin(0)=0 → rightmost point of the ellipse
    expect(s.vx).toBeCloseTo(CHAT_CENTER.vx + CHAT_ORBIT.rx);
    expect(s.vy).toBeCloseTo(CHAT_CENTER.vy);
    expect(s.scale).toBe(CHAT_CENTER.scale);

    const dx = s.vx - CHAT_CENTER.vx;
    const dy = s.vy - CHAT_CENTER.vy;
    // Ellipse: (dx/rx)^2 + (dy/ry)^2 === 1
    expect((dx / CHAT_ORBIT.rx) ** 2 + (dy / CHAT_ORBIT.ry) ** 2).toBeCloseTo(1);
  });

  it("moves around the centre as elapsed time increases (not a fixed hold)", () => {
    const samples = [0, 0.5, 1.2, 2.4, 4.0].map((t) => sampleChatOrbit(t));
    // At least two distinct positions
    const keys = new Set(samples.map((s) => `${s.vx.toFixed(4)},${s.vy.toFixed(4)}`));
    expect(keys.size).toBeGreaterThanOrEqual(3);

    // Never collapses to the single center hold
    for (const s of samples) {
      const dist = Math.hypot(s.vx - CHAT_CENTER.vx, s.vy - CHAT_CENTER.vy);
      expect(dist).toBeGreaterThan(0.1);
    }
  });

  it("returns to the same phase after a full 2π period", () => {
    const period = (2 * Math.PI) / CHAT_ORBIT.speed;
    const a = sampleChatOrbit(1.1);
    const b = sampleChatOrbit(1.1 + period);
    expect(b.vx).toBeCloseTo(a.vx, 5);
    expect(b.vy).toBeCloseTo(a.vy, 5);
  });
});
