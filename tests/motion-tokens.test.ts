import { describe, it, expect } from "vitest";
import { parseDurationToSeconds } from "@/lib/motion/tokens";

describe("parseDurationToSeconds (TASK-DS-009)", () => {
  it("parses milliseconds and seconds to seconds", () => {
    expect(parseDurationToSeconds("250ms", 1)).toBeCloseTo(0.25);
    expect(parseDurationToSeconds("1100ms", 1)).toBeCloseTo(1.1);
    expect(parseDurationToSeconds("0.5s", 1)).toBeCloseTo(0.5);
    expect(parseDurationToSeconds("  640ms  ", 1)).toBeCloseTo(0.64);
  });

  it("falls back for empty, missing, or unparseable values", () => {
    expect(parseDurationToSeconds("", 1.1)).toBe(1.1);
    expect(parseDurationToSeconds(null, 1.1)).toBe(1.1);
    expect(parseDurationToSeconds(undefined, 1.1)).toBe(1.1);
    expect(parseDurationToSeconds("abc", 1.1)).toBe(1.1);
    expect(parseDurationToSeconds("0ms", 1.1)).toBe(1.1);
  });
});
