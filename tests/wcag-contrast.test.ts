import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  overRgba,
  flattenOpaque,
  compositeSolidLayers,
  contrastRatio,
} from "../scripts/wcag-contrast.mjs";

describe("overRgba (Porter-Duff source-over)", () => {
  it("opaque source replaces destination", () => {
    expect(overRgba([255, 0, 0, 1], [0, 255, 0, 1])).toEqual([255, 0, 0, 1]);
  });

  it("transparent source leaves destination unchanged", () => {
    expect(overRgba([255, 0, 0, 0], [0, 128, 0, 1])).toEqual([0, 128, 0, 1]);
  });

  it("preserves partial alpha instead of forcing opacity after one blend", () => {
    // 50% black over 50% white → mid grey at a=0.75, not opaque black.
    const mid = overRgba([0, 0, 0, 0.5], [255, 255, 255, 0.5]);
    expect(mid[3]).toBeCloseTo(0.75, 5);
    expect(mid[0]).toBeLessThan(128);
    // Broken probe used acc.concat(1) which would report opaque black here.
    expect(mid[3]).toBeLessThan(1);
  });

  it("50% black over opaque white is #808080", () => {
    expect(overRgba([0, 0, 0, 0.5], [255, 255, 255, 1])).toEqual([128, 128, 128, 1]);
  });
});

describe("compositeSolidLayers", () => {
  it("walks nearest-over-farthest and flattens onto white", () => {
    // 50% black over transparent → flatten on white → #808080
    expect(compositeSolidLayers([[0, 0, 0, 0.5]])).toEqual([128, 128, 128]);
  });

  it("stacks two translucent layers without discarding either alpha", () => {
    // Nearest: 50% black; farther: 50% white; then flatten on opaque red fallback.
    // Broken code forced each blend to opaque and would ignore the red fallback.
    const rgb = compositeSolidLayers(
      [
        [0, 0, 0, 0.5],
        [255, 255, 255, 0.5],
      ],
      [255, 0, 0],
    );
    // Accumulated a before flatten: 0.5 + 0.5*(1-0.5) = 0.75; not yet opaque,
    // so red must still influence the result (R channel > 0 from fallback).
    expect(rgb[0]).toBeGreaterThan(0);
    expect(rgb[1]).toBeGreaterThan(0);
    expect(rgb[2]).toBeGreaterThan(0);
  });

  it("stops early once an opaque layer is reached under nearer content", () => {
    // Opaque green under translucent black — green is the only backdrop that matters.
    expect(compositeSolidLayers([[0, 0, 0, 0.5], [0, 255, 0, 1], [255, 0, 0, 1]])).toEqual(
      overRgba([0, 0, 0, 0.5], [0, 255, 0, 1]).slice(0, 3),
    );
  });
});

describe("flattenOpaque + contrastRatio", () => {
  it("black text on white is 21:1", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBe(21);
  });

  it("composites translucent fg over backdrop before contrast", () => {
    const back = flattenOpaque([255, 255, 255, 1]);
    const fg = overRgba([0, 0, 0, 1], [...back, 1]).slice(0, 3);
    expect(contrastRatio(fg, back)).toBe(21);
  });
});

describe("probe-ds-buttons.mjs stays aligned", () => {
  const probeSrc = readFileSync(new URL("../scripts/probe-ds-buttons.mjs", import.meta.url), "utf8");

  it("defines 15 PATHS (including root and cyberos/content-policy)", () => {
    const block = probeSrc.match(/const PATHS = \[([\s\S]*?)\];/)?.[1] ?? "";
    const paths = [...block.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    expect(paths).toHaveLength(15);
    expect(paths[0]).toBe("");
    expect(paths).toContain("/cyberos/content-policy");
  });

  it("embeds Porter-Duff over that preserves both alphas (no concat(1) discard)", () => {
    expect(probeSrc).toMatch(/const a = fa \+ ba \* \(1 - fa\)/);
    expect(probeSrc).not.toMatch(/acc\.concat\(1\)/);
    expect(probeSrc).not.toMatch(/c\.slice\(0, 3\)\)\.concat\(1\)/);
  });
});
