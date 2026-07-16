import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  deferScripts,
  hasEagerNextScripts,
  LOADER_ID,
} from "../scripts/defer-hydration-lib.mjs";

const root = resolve(import.meta.dirname, "..");

describe("defer-hydration post-build (mobile Lantern LCP)", () => {
  it("ships the post-build script and hooks it into npm run build", () => {
    const script = readFileSync(resolve(root, "scripts/defer-hydration.mjs"), "utf8");
    expect(script).toContain("defer-hydration-lib");
    expect(script).toContain("critters");
    expect(script).toMatch(/homepage gate|FAIL/);

    const lib = readFileSync(resolve(root, "scripts/defer-hydration-lib.mjs"), "utf8");
    expect(lib).toContain("data-cs-defer-src");
    expect(lib).toContain(LOADER_ID);
    expect(lib).toMatch(/pointerdown|scroll|touchstart/);
    expect(lib).toMatch(/setTimeout\(go,\s*12000\)/);

    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts.build).toMatch(/defer-hydration/);
  });

  it("deferScripts() rewrites eager Next chunks and keeps theme boot", () => {
    const fixture = [
      "<!DOCTYPE html><html><head>",
      '<link rel="stylesheet" href="/_next/static/css/x.css"/>',
      '<link rel="preload" as="script" href="/_next/static/chunks/webpack.js"/>',
      '<script src="/_next/static/chunks/main-app.js" async=""></script>',
      "</head><body>",
      "<script>(function(){try{var t=localStorage.getItem('cs-theme');if(t){}}catch(e){}})();</script>",
      '<script type="application/ld+json">{"@type":"Organization"}</script>',
      '<h1 class="cs-hero-title">Hello</h1>',
      "</body></html>",
    ].join("");

    const { html, changed } = deferScripts(fixture);
    expect(changed).toBe(true);
    expect(html).toContain(LOADER_ID);
    expect(html).toContain('data-cs-defer-src="/_next/static/chunks/main-app.js"');
    expect(html).toContain("cs-theme");
    expect(html).toContain('type="application/ld+json"');
    expect(hasEagerNextScripts(html)).toBe(false);
    // Script preloads stripped so they don't race the critical path
    expect(html).not.toMatch(/rel=["']preload["'][^>]*as=["']script["']/);
  });

  it("when .next HTML exists after build, hydration scripts are deferred", () => {
    const en = resolve(root, ".next/server/app/en.html");
    if (!existsSync(en)) {
      expect(existsSync(resolve(root, "scripts/defer-hydration.mjs"))).toBe(true);
      return;
    }
    const html = readFileSync(en, "utf8");
    expect(html).toContain(LOADER_ID);
    expect(html).toContain("data-cs-defer-src");
    expect(html).toMatch(/cs-theme[\s\S]{0,200}localStorage|localStorage[\s\S]{0,200}cs-theme/);
    expect(hasEagerNextScripts(html)).toBe(false);
  });
});
