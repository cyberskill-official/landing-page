// @vitest-environment node
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

describe("Phase 1: fonts + package token SoT", () => {
  it("loads package CSS without fonts.css; DeferredFonts owns webfonts", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
    expect(layout).toContain('import "./cs-package.css"');
    expect(layout).not.toMatch(/@cyberskill\/design\/styles\.css/);
    expect(layout).toMatch(/DeferredFonts/);
    expect(layout).toMatch(/data-cs-element="hoa"/);
    expect(layout).toMatch(/data-cs-variant="plasma"/);
    expect(layout).toMatch(/className="cs-display-face"/);

    const deferred = readFileSync(resolve(root, "components/DeferredFonts.tsx"), "utf8");
    expect(deferred).toMatch(/href\s*=\s*["']\/fonts\/brand-fonts\.css["']/);
    // Sole webfont stylesheet path — no alternate .css hrefs
    const stylesheetHrefs = [...deferred.matchAll(/\.href\s*=\s*["']([^"']+)["']/g)].map(
      (m) => m[1],
    );
    expect(stylesheetHrefs).toEqual(["/fonts/brand-fonts.css"]);

    const brand = readFileSync(resolve(root, "public/fonts/brand-fonts.css"), "utf8");
    expect(brand).toMatch(/@font-face/i);
    expect(brand).toMatch(/font-display:\s*optional/);
    expect(brand).not.toMatch(/font-display:\s*(swap|block|fallback|auto)\b/i);
    expect(brand).toMatch(/Space Grotesk/);
    expect(brand).toMatch(/\/fonts\/ds\//);
    expect(existsSync(resolve(root, "public/fonts/ds/spacegrotesk-var-latin.woff2"))).toBe(
      true,
    );

    const pkg = readFileSync(resolve(root, "app/cs-package.css"), "utf8");
    expect(pkg).not.toMatch(/@import\b[^;]*fonts\.css/);
    expect(pkg).toMatch(/tokens\/colors\.css/);
    expect(pkg).toMatch(/tokens\/typography\.css/);
    expect(pkg).toMatch(/base\/components\.css/);
  });

  it("globals aliases storytelling names onto package semantics (not the reverse)", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    expect(css).toMatch(/--cs-color-fg:\s*var\(--cs-color-text-primary\)/);
    expect(css).toMatch(/--cs-color-bg:\s*var\(--cs-color-surface-page\)/);
    expect(css).toMatch(/--cs-color-surface:\s*var\(--cs-color-surface-panel\)/);
    expect(css).toMatch(/--cs-color-line:\s*var\(--cs-color-border-default\)/);
    // Must not overwrite package SoT from storytelling names
    expect(css).not.toMatch(/--cs-color-text-primary:\s*var\(--cs-color-fg\)/);
    expect(css).not.toMatch(/--cs-color-surface-page:\s*var\(--cs-color-bg\)/);
    expect(css).toMatch(/--cs-font-display:\s*var\(--cs-font-family-display\)/);
    expect(css).toMatch(/--cs-font-sans:\s*var\(--cs-font-family-ui\)/);
  });

  it("ships a Phase 1 decision note", () => {
    const note = readFileSync(
      resolve(root, "docs/decisions/2026-07-25-lumi-ds-phase1-fonts-tokens.md"),
      "utf8",
    );
    expect(note).toMatch(/Phase 1/);
    expect(note).toMatch(/cs-package\.css/);
    expect(note).toMatch(/DeferredFonts/);
    expect(note).toMatch(/hoa/);
    expect(note).toMatch(/plasma/);
  });

  it("ships a display-face adoption decision + sync script", () => {
    const note = readFileSync(
      resolve(root, "docs/decisions/2026-07-25-lumi-ds-display-face.md"),
      "utf8",
    );
    expect(note).toMatch(/cs-font-family-display/);
    expect(note).toMatch(/cs-display-face/);
    expect(note).toMatch(/sync-ds-fonts/);
    expect(existsSync(resolve(root, "scripts/sync-ds-fonts.mjs"))).toBe(true);
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.scripts["sync:ds:fonts"]).toMatch(/sync-ds-fonts/);
    expect(pkg.scripts.postinstall).toMatch(/sync-ds-fonts/);
    expect(pkg.dependencies["@cyberskill/design"]).toMatch(
      /3edeb1350c2e48761bee18f7c10c323e6103ff7d/,
    );
  });
});
