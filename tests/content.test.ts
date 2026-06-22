import { describe, it, expect } from "vitest";
import { work, services, scenes } from "@/lib/content/site";
import { track } from "@/lib/analytics";

describe("content integrity", () => {
  it("work slugs are unique and non-empty", () => {
    const slugs = work.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s.length).toBeGreaterThan(0);
  });

  it("every work item carries EN and VN title and result", () => {
    for (const w of work) {
      expect(w.title.en.length && w.title.vi.length).toBeTruthy();
      expect(w.result.en.length && w.result.vi.length).toBeTruthy();
    }
  });

  it("services have EN and VN copy and at least one outcome", () => {
    for (const s of services) {
      expect(s.title.en.length && s.title.vi.length).toBeTruthy();
      expect(s.outcomes.length).toBeGreaterThan(0);
    }
  });

  it("scenes carry EN and VN copy", () => {
    for (const sc of scenes) {
      expect(sc.heading.en.length && sc.heading.vi.length).toBeTruthy();
    }
  });
});

describe("analytics helper", () => {
  it("no-ops without a window (server) and never throws", () => {
    expect(() => track("genie_open")).not.toThrow();
    expect(() => track("lead_submitted", { source: "test" })).not.toThrow();
  });
});
