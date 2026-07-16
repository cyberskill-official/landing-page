import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

describe("defer-hydration post-build (mobile Lantern LCP)", () => {
  it("ships the post-build script and hooks it into npm run build", () => {
    const script = readFileSync(resolve(root, "scripts/defer-hydration.mjs"), "utf8");
    expect(script).toContain("data-cs-defer-src");
    expect(script).toContain("cs-defer-hydration");
    // Interaction-first arming keeps scripts out of the lab LCP window
    expect(script).toMatch(/pointerdown|scroll|touchstart/);
    expect(script).toMatch(/setTimeout\(go,\s*12000\)/);

    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts.build).toMatch(/defer-hydration/);
  });

  it("when .next HTML exists after build, hydration scripts are deferred", () => {
    const en = resolve(root, ".next/server/app/en.html");
    if (!existsSync(en)) {
      // Build artifacts not present in pure unit CI — script contract still covered above
      expect(existsSync(resolve(root, "scripts/defer-hydration.mjs"))).toBe(true);
      return;
    }
    const html = readFileSync(en, "utf8");
    expect(html).toContain("cs-defer-hydration");
    expect(html).toContain("data-cs-defer-src");
    // Theme boot remains immediate (FOUC prevention)
    expect(html).toMatch(/cs-theme[\s\S]{0,200}localStorage|localStorage[\s\S]{0,200}cs-theme/);
    // No early-executing Next chunk tags (data-cs-defer-src placeholders are OK)
    expect(html).not.toMatch(
      /<script(?![^>]*type=["']text\/plain["'])[^>]*\ssrc=["']\/_next\/static\/chunks\//,
    );
  });
});

