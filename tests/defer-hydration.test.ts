import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  deferScripts,
  inlineAppStylesheet,
  transformPrerenderHtml,
  hasEagerNextScripts,
  hasBlockingAppStylesheet,
  hasCriticalCss,
  LOADER_ID,
  CRITICAL_STYLE_ID,
} from "../scripts/defer-hydration-lib.mjs";

const root = resolve(import.meta.dirname, "..");

describe("defer-hydration post-build (mobile Lantern LCP)", () => {
  it("ships the post-build script and hooks it into npm run build", () => {
    const script = readFileSync(resolve(root, "scripts/defer-hydration.mjs"), "utf8");
    expect(script).toContain("defer-hydration-lib");
    expect(script).toMatch(/homepage gate|FAIL/);
    expect(script).toContain("/vercel/output");
    expect(script).toContain("hasCriticalCss");
    expect(script).toContain("inline-app-css");

    const lib = readFileSync(resolve(root, "scripts/defer-hydration-lib.mjs"), "utf8");
    expect(lib).toContain("data-cs-defer-src");
    expect(lib).toContain(LOADER_ID);
    expect(lib).toContain("inlineAppStylesheet");
    expect(lib).toMatch(/pointerdown|scroll|touchstart/);
    expect(lib).toMatch(/setTimeout\(go,\s*12000\)/);

    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts.build).toMatch(/run-next-build/);
    const runner = readFileSync(resolve(root, "scripts/run-next-build.mjs"), "utf8");
    expect(runner).toContain("patch-html-writes");
    expect(runner).toContain("defer-hydration.mjs");
    const patch = readFileSync(resolve(root, "scripts/patch-html-writes.mjs"), "utf8");
    expect(patch).toContain("transformPrerenderHtml");
    expect(patch).toContain("loadBuiltCss");
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
    expect(html).not.toMatch(/rel=["']preload["'][^>]*as=["']script["']/);
  });

  it("inlineAppStylesheet() embeds CSS and removes external app stylesheets", () => {
    const fixture = [
      "<!DOCTYPE html><html><head>",
      `<style id="${CRITICAL_STYLE_ID}">body{margin:0}</style>`,
      '<link rel="stylesheet" href="/_next/static/css/abc.css" data-precedence="next"/>',
      "</head><body><h1>Hi</h1></body></html>",
    ].join("");
    const css = ".cs-hero{color:red}".repeat(20);
    const { html, changed } = inlineAppStylesheet(fixture, css);
    expect(changed).toBe(true);
    expect(html).toContain('id="cs-full-inline"');
    expect(html).toContain(".cs-hero{color:red}");
    expect(hasBlockingAppStylesheet(html)).toBe(false);
    expect(html).not.toMatch(/href="\/_next\/static\/css\//);
  });

  it("transformPrerenderHtml() defers scripts and inlines CSS together", () => {
    const fixture = [
      "<!DOCTYPE html><html><head>",
      `<style id="${CRITICAL_STYLE_ID}">${"x".repeat(250)}</style>`,
      '<link rel="stylesheet" href="/_next/static/css/abc.css" data-precedence="next"/>',
      '<script src="/_next/static/chunks/main-app.js" async=""></script>',
      "</head><body>",
      "<script>(function(){try{var t=localStorage.getItem('cs-theme');}catch(e){}})();</script>",
      "<h1>Hello</h1></body></html>",
    ].join("");
    const css = "body{margin:0}".repeat(30);
    const { html, changed } = transformPrerenderHtml(fixture, css);
    expect(changed).toBe(true);
    expect(hasEagerNextScripts(html)).toBe(false);
    expect(hasBlockingAppStylesheet(html)).toBe(false);
    expect(hasCriticalCss(html)).toBe(true);
    expect(html).toContain("cs-full-inline");
    expect(html).toContain(LOADER_ID);
  });

  it("when .next HTML exists after build, hydration scripts are deferred and CSS inlined", () => {
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
    expect(hasCriticalCss(html)).toBe(true);
    expect(hasBlockingAppStylesheet(html)).toBe(false);
    expect(html).toContain("cs-full-inline");
  });
});
