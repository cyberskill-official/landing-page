import { describe, it, expect } from "vitest";
import { apcaLc, rgbToY, lcHexOnRgb } from "../scripts/apca.mjs";

// Validate the APCA-W3 (0.1.9) implementation against published reference values
// so the FR-DS-006 contrast tooling is trustworthy.
describe("APCA-W3 contrast core (FR-DS-006)", () => {
  it("black on white is about Lc 106", () => {
    expect(apcaLc(rgbToY([0, 0, 0]), rgbToY([255, 255, 255]))).toBeCloseTo(106.04, 0);
  });

  it("white on black is about Lc -108 (reverse polarity)", () => {
    expect(apcaLc(rgbToY([255, 255, 255]), rgbToY([0, 0, 0]))).toBeCloseTo(-107.88, 0);
  });

  it("mid grey #888 on white is about Lc 63", () => {
    expect(lcHexOnRgb("#888888", [255, 255, 255])).toBeCloseTo(63.06, 0);
  });
});
