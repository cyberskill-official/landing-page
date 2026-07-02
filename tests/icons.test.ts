import { describe, it, expect } from "vitest";
import { icons, type IconName } from "@/lib/icons";

describe("icon set (FR-DS-010)", () => {
  const names: IconName[] = [
    "close",
    "sun",
    "moon",
    "arrow-right",
    "check",
    "sparkle",
    "chat",
    "sound-on",
    "sound-off",
  ];

  it("defines every expected icon with a viewBox and at least one element", () => {
    for (const name of names) {
      const def = icons[name];
      expect(def, name).toBeDefined();
      expect(def.viewBox.split(/\s+/)).toHaveLength(4);
      expect(def.els.length).toBeGreaterThan(0);
      for (const el of def.els) {
        expect(["path", "circle", "line"]).toContain(el.tag);
        expect(Object.keys(el.attrs).length).toBeGreaterThan(0);
      }
    }
  });
});
