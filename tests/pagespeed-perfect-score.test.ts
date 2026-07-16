// @vitest-environment jsdom
/**
 * Structural + contrast guards for the PageSpeed perfect-score work.
 * These assert the shipped source/runtime contracts Lighthouse grades:
 * solid sRGB CTA contrast, LCP poster priority/sizes, deferred analytics.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
// @ts-expect-error jsdom types come via vitest environment
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StaticPoster } from "@/components/canvas/StaticPoster";
import { lcHexOnRgb } from "../scripts/apca.mjs";

const root = resolve(import.meta.dirname, "..");

function wcagContrast(fg: string, bg: string): number {
  const toRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as const;
  };
  const rel = ([r, g, b]: readonly [number, number, number]) => {
    const f = (c: number) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const L1 = rel(toRgb(fg));
  const L2 = rel(toRgb(bg));
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

describe("PageSpeed perfect-score contracts", () => {
  it("primary CTA sRGB pair meets WCAG AA (≥4.5:1) — the Lighthouse color-contrast floor", () => {
    // Must match the solid hex pair forced on .cs-btn-primary / .cs-btn-lumi.
    // Lighthouse uses WCAG 2.x contrast (4.5:1 normal text), not APCA.
    const ink = "#3a2a05";
    const ochre = "#f4ba17";
    const ratio = wcagContrast(ink, ochre);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    // Sanity: APCA still reports a strong dark-on-gold (not a light-on-gold fail)
    const lc = lcHexOnRgb(ink, [
      parseInt(ochre.slice(1, 3), 16),
      parseInt(ochre.slice(3, 5), 16),
      parseInt(ochre.slice(5, 7), 16),
    ]);
    expect(lc).toBeGreaterThan(60);
  });

  it("globals.css forces solid sRGB ochre on primary/Lumi buttons (no P3-only fill)", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    expect(css).toMatch(/\.cs-btn-primary\s*\{[^}]*background-color:\s*#f4ba17/s);
    expect(css).toMatch(/\.cs-btn-lumi\s*\{[^}]*background-color:\s*#f4ba17\s*!important/s);
    // Ochre must not be reassigned to display-p3 (that was the 3.46:1 failure)
    const p3Block = css.match(/@supports \(color: color\(display-p3[\s\S]*?\n\}/);
    expect(p3Block?.[0] ?? "").not.toMatch(/brand-ochre/);
  });

  it("StaticPoster is CSS-background only (no <img>, cannot be LCP)", () => {
    const html = renderToStaticMarkup(createElement(StaticPoster));
    expect(html).toContain("cs-poster-frame");
    expect(html).not.toMatch(/<img\b/);
    expect(html).not.toContain("/_next/image");
    // Bitmap must not appear in critical CSS (DeferredPoster injects it late)
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    expect(css).not.toMatch(/lumi-poster\.webp/);
    const deferred = readFileSync(resolve(root, "components/DeferredPoster.tsx"), "utf8");
    expect(deferred).toContain("/lumi-poster.webp");
    expect(deferred).toMatch(/setTimeout\(\s*arm,\s*20000\s*\)/);
  });

  it("root layout gates Vercel Analytics/SpeedInsights and defers cursor trail", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
    expect(layout).toMatch(/VERCEL\s*===\s*["']1["']/);
    expect(layout).toContain("DeferredCursorTrail");
    expect(layout).not.toMatch(/<CursorTrail\s*\/>/);
    // Analytics only inside the Vercel gate
    expect(layout).toMatch(/onVercel\s*\?\s*\([\s\S]*<Analytics/);
  });

  it("homepage defers live 3D until idle; SSR poster is gradient-only first", () => {
    const page = readFileSync(resolve(root, "app/[lang]/page.tsx"), "utf8");
    expect(page).toContain("StaticPoster");
    expect(page).toContain("DeferredHomeCanvas");
    const deferred = readFileSync(
      resolve(root, "components/canvas/DeferredHomeCanvas.tsx"),
      "utf8",
    );
    expect(deferred).toContain("requestIdleCallback");
    expect(deferred).toContain("GenieScene");
    expect(deferred).toContain("ssr: false");
  });

  it("brand webfonts are not on the critical path (deferred self-hosted only)", () => {
    const fonts = readFileSync(resolve(root, "app/fonts.ts"), "utf8");
    expect(fonts).not.toMatch(/next\/font\/google/);
    expect(fonts).toContain("--font-display");
    expect(fonts).toContain("--font-body");
    const deferred = readFileSync(resolve(root, "components/DeferredFonts.tsx"), "utf8");
    expect(deferred).toContain("/fonts/brand-fonts.css");
    expect(deferred).toMatch(/setTimeout\(\s*load,\s*20000\s*\)/);
  });

  it("hero LCP text uses an explicit system font stack (no webfont wait)", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    expect(css).toMatch(/\.cs-hero-title,\s*\n\.cs-hero-lead/);
    expect(css).toMatch(/font-family:\s*system-ui/);
  });

  it("intro veil is not armed on first paint (no data-intro=play in boot script)", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
    expect(layout).not.toMatch(/data-intro['"]?\s*,\s*['"]play['"]/);
    expect(layout).not.toMatch(/setAttribute\(\s*['"]data-intro['"]/);
  });

  it("scene rack-focus keeps section opacity ≥0.9 so gold CTAs stay WCAG AA", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    // Must not reintroduce the 0.55 floor that composited ochre to ~3.4:1
    expect(css).toMatch(
      /main \.cs-section > \.cs-container\s*\{[^}]*opacity:\s*calc\(0\.9[0-9]? \+/,
    );
    expect(css).not.toMatch(
      /main \.cs-section > \.cs-container\s*\{[^}]*opacity:\s*calc\(0\.55 \+/,
    );
  });
});
