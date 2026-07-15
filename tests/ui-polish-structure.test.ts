import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { VerifyUs } from "@/components/sections/VerifyUs";
import { NewsletterForm } from "@/components/cta/NewsletterForm";
import { getOpeningChips } from "@/lib/genie/scriptedChat";

const css = () =>
  fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

describe("ui polish structure", () => {
  it("keeps genie chips and form from being flex-clipped", () => {
    const src = css();
    expect(src).toMatch(/\.cs-genie-log\s*\{[^}]*min-height/s);
    expect(src).toMatch(/\.cs-genie-chips\s*\{[^}]*flex-shrink:\s*0/s);
    expect(src).toMatch(/\.cs-genie-form\s*\{[^}]*flex-shrink:\s*0/s);
  });

  it("shares one mobile bottom clearance token for body, genie, and footer", () => {
    const src = css();
    // Token defined once
    expect(src).toMatch(/--cs-mobile-bottom-clearance:\s*calc\(/);
    expect(src).toMatch(/--cs-mobile-cta-height:\s*76px/);
    expect(src).toMatch(/--cs-mobile-chrome-gap:\s*0\.5rem/);
    // Body pad + genie bottom + footer pad all consume the same var (no divergent 4.5rem/76px)
    expect(src).toMatch(/body\s*\{\s*padding-bottom:\s*var\(--cs-mobile-bottom-clearance\)/);
    expect(src).toMatch(/\.cs-genie\s*\{[^}]*bottom:\s*var\(--cs-mobile-bottom-clearance\)/s);
    expect(src).toMatch(/\.cs-footer\s*\{[^}]*var\(--cs-mobile-bottom-clearance\)/s);
    // Old brittle offset must not reappear
    expect(src).not.toMatch(/bottom:\s*calc\(4\.5rem/);
  });

  it("newsletter form uses theme tokens not hard-coded white glass", () => {
    const html = renderToStaticMarkup(createElement(NewsletterForm, { locale: "en" }));
    expect(html).toContain("cs-newsletter-form");
    expect(html).not.toMatch(/rgba\(255,\s*255,\s*255/);
    expect(html).toContain('type="email"');
    const src = css();
    expect(src).toMatch(/\[data-theme="dark"\]\s*\.cs-newsletter-form input/);
  });

  it("footer compact verify-us remains compact without map", () => {
    const html = renderToStaticMarkup(
      createElement(VerifyUs, { locale: "en", variant: "compact" }),
    );
    expect(html).toContain("cs-verify-us--compact");
    expect(html).not.toContain("office-map.svg");
    expect(html).toContain("data-engineering-claims");
  });

  it("opening chips still provide discovery surface for Lumi", () => {
    const chips = getOpeningChips("en");
    expect(chips.length).toBeGreaterThanOrEqual(6);
    expect(chips.some((c) => c.id === "wish")).toBe(true);
    expect(chips.some((c) => c.id === "quiz_start")).toBe(true);
  });

  it("dark form fields and genie inputs use dark raised surfaces", () => {
    const src = css();
    expect(src).toMatch(/\[data-theme="dark"\][^{]*\.cs-field input[^{]*\{[^}]*#1a120c/s);
    expect(src).toMatch(/\[data-theme="dark"\][^{]*\.cs-genie-form input[^{]*\{[^}]*#1a120c/s);
  });
});
