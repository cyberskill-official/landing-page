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
const geniePanel = () =>
  fs.readFileSync(path.join(process.cwd(), "components/genie/GenieChatPanel.tsx"), "utf8");
const genieScene = () =>
  fs.readFileSync(path.join(process.cwd(), "components/canvas/GenieScene.tsx"), "utf8");

describe("ui polish structure", () => {
  it("keeps genie chips and form from being flex-clipped", () => {
    const src = css();
    expect(src).toMatch(/\.cs-genie-log\s*\{[^}]*min-height/s);
    expect(src).toMatch(/\.cs-genie-chips\s*\{[^}]*flex-shrink:\s*0/s);
    expect(src).toMatch(/\.cs-genie-form\s*\{[^}]*flex-shrink:\s*0/s);
  });

  it("shares one mobile bottom clearance token for body and footer; genie is modal", () => {
    const src = css();
    expect(src).toMatch(/--cs-mobile-bottom-clearance:\s*calc\(/);
    expect(src).toMatch(/--cs-mobile-cta-height:\s*76px/);
    expect(src).toMatch(/--cs-mobile-chrome-gap:\s*0\.5rem/);
    expect(src).toMatch(/body\s*\{\s*padding-bottom:\s*var\(--cs-mobile-bottom-clearance\)/);
    expect(src).toMatch(/\.cs-footer\s*\{[^}]*var\(--cs-mobile-bottom-clearance\)/s);
    // Lumi is a centered modal cloud (not corner dock)
    expect(src).toMatch(/\.cs-genie-root\s*\{[^}]*position:\s*fixed/s);
    expect(src).toMatch(/\.cs-genie-root\s*\{[^}]*justify-content:\s*center/s);
    expect(src).toMatch(/\.cs-genie-stage/);
    expect(src).toMatch(/cs-energy-dash|cs-genie-energy-stroke/);
    expect(src).toMatch(/data-genie-open.*cs-canvas-live|cs-canvas-live.*z-index:\s*92/s);
    expect(src).toMatch(/\.cs-canvas-live\s*\{\s*z-index:\s*35/);
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
    expect(chips.length).toBeGreaterThanOrEqual(8);
    expect(chips.some((c) => c.id === "wish")).toBe(true);
    expect(chips.some((c) => c.id === "quiz_start")).toBe(true);
    expect(chips.some((c) => c.id === "mvp_start" || c.id === "book_call")).toBe(true);
  });

  it("dark form fields and genie inputs use dark raised surfaces", () => {
    const src = css();
    expect(src).toMatch(/\[data-theme="dark"\][^{]*\.cs-field input[^{]*\{[^}]*#1a120c/s);
    // Genie input is smoke-glass (rgba) so it blends into the painted cloud shell
    expect(src).toMatch(
      /\[data-theme="dark"\][^{]*\.cs-genie-form input[^{]*\{[^}]*(#1a120c|rgba\(\s*16\s*,\s*10\s*,\s*6)/s,
    );
  });

  it("chat open uses big scene Lumi orbit, not a mini panel avatar", () => {
    const panel = geniePanel();
    // No poster/stamp avatar standing in for the scene mascot
    expect(panel).not.toMatch(/lumi-poster\.webp/);
    expect(panel).not.toMatch(/cs-genie-lumi-img|cs-genie-lumi-figure|cs-genie-lumi-fly/);
    // Option A: painted cloud art shell + freehand energy streams
    expect(panel).toMatch(/lumi-cloud\.(webp|png|jpg)|cs-genie-cloud-art/);
    expect(panel).toMatch(/cs-genie-energy-stroke|cs-genie-energy-svg/);
    expect(panel).toMatch(/cs-genie-energy-spark/);
    // Freehand paths only — no rect energy frame, no interior stroke-e
    expect(panel).not.toMatch(/cs-genie-energy-stroke-e/);
    expect(panel).not.toMatch(/<rect[^>]*cs-genie-energy-stroke/);

    const scene = genieScene();
    expect(scene).toMatch(/sampleChatOrbit/);
    expect(scene).toMatch(/data-genie-open/);
    expect(scene).toMatch(/ChatEnergyBeam/);
    // Projected orbit position exposed for open-chat mascot audits
    expect(scene).toMatch(/lumiChatX|dataset\.lumiChatX/);
  });

  it("energy SVG stacks behind the dialog so chrome stays readable", () => {
    const src = css();
    // Energy layer z-index must be below .cs-genie (content)
    expect(src).toMatch(/\.cs-genie-energy-svg\s*\{[^}]*z-index:\s*1/s);
    expect(src).toMatch(/\.cs-genie\s*\{[^}]*z-index:\s*2/s);
    // Open wisps + ambient rim (no closed portal oval) + cloud art
    expect(src).toMatch(/cs-genie-energy-ambient|cs-energy-pulse/);
    expect(src).toMatch(/cs-genie-cloud-art/);
  });

  it("cloud shell is a fixed frame; page scroll locked while open", () => {
    const src = css();
    // Fixed shell dimensions (not content-driven height growth)
    expect(src).toMatch(/--cs-genie-shell-h:/);
    expect(src).toMatch(/\.cs-genie-stage\s*\{[^}]*height:\s*var\(--cs-genie-shell-h\)/s);
    // Body/html locked when chat open
    expect(src).toMatch(/html\[data-genie-open\][^{]*body[^{]*\{[^}]*overflow:\s*hidden/s);
    // Log is the scroll container
    expect(src).toMatch(/\.cs-genie-log\s*\{[^}]*overscroll-behavior:\s*contain/s);
  });

  it("drops permanent dual bottom chrome; taller log for ~3 bubble rows; transparent cloud shell", () => {
    const panel = geniePanel();
    // Consent only when consentStep — not always under chips
    expect(panel).toMatch(/consentStep\s*&&/);
    // No permanent mode-hint footer in SCRIPTED path
    expect(panel).not.toMatch(/cs-genie-mode-hint/);
    // Operator jargon must not appear as user-facing mode hints
    expect(panel).not.toMatch(/SCRIPTED consult — pick a topic/);
    expect(panel).not.toMatch(/Info-capture step \(COLLECT\)/);

    const src = css();
    // Height token raised for ~3 bubble rows
    expect(src).toMatch(/--cs-genie-shell-h:\s*min\(88vh,\s*780px\)/);
    expect(src).toMatch(/--cs-genie-bubble-row:/);
    expect(src).toMatch(/\.cs-genie-log\s*\{[^}]*min-height:\s*calc\(\s*var\(--cs-genie-bubble-row/s);
    // Organic mask kills square plate read
    expect(src).toMatch(/\.cs-genie-cloud-art-wrap\s*\{[^}]*mask-image:\s*radial-gradient/s);
    // Chips area shows ~3 rows of choice bubbles
    expect(src).toMatch(/\.cs-genie-chips\s*\{[^}]*max-height:\s*7\.25rem/s);
    expect(src).toMatch(/\.cs-genie-chips\s*\{[^}]*min-height:\s*calc\(2\.05rem\s*\*\s*3/s);
    // Shell / art wrap / inner fully transparent (no frosted plate)
    expect(src).toMatch(/\.cs-genie-cloud-art-wrap\s*\{[^}]*background:\s*transparent\s*!important/s);
    expect(src).toMatch(/\.cs-genie-cloud-inner\s*\{[^}]*background:\s*transparent\s*!important/s);
    expect(src).toMatch(/\.cs-genie\s*\{[^}]*background:\s*transparent\s*!important/s);
    expect(src).toMatch(/\.cs-genie-stage\s*\{[^}]*backdrop-filter:\s*none\s*!important/s);
  });

  it("ships magical Vietnamese-capable fonts and lamp-style cursor", () => {
    const fonts = fs.readFileSync(path.join(process.cwd(), "app/fonts.ts"), "utf8");
    expect(fonts).toMatch(/Be_Vietnam_Pro|Be Vietnam Pro/);
    expect(fonts).toMatch(/Space_Grotesk|Space Grotesk/);
    expect(fonts).toMatch(/vietnamese/);
    expect(fonts).toMatch(/--font-body/);
    expect(fonts).toMatch(/--font-display/);

    const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
    expect(layout).toMatch(/bodyFont/);
    expect(layout).toMatch(/displayFont/);

    const src = css();
    expect(src).toMatch(/--cs-font-sans:\s*var\(--font-body/);
    expect(src).toMatch(/--cs-font-display:\s*var\(--font-display/);
    // Magical compass-point cursor ring
    expect(src).toMatch(/\.cs-cursor-dot\s*\{[^}]*radial-gradient/s);
    expect(src).toMatch(/\.cs-cursor-ring\s*\{[^}]*-17px\s+0\s+0\s+-14px/s);
    expect(src).toMatch(/data-cs-cursor="on"/);
  });
});
