// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");

/** Every production source file — the gates below scan the whole set, not a sample. */
function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(tsx|ts|css)$/.test(entry)) {
        out.push(full);
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(resolve(root, dir));
  return out;
}

const FORM_FILES = [
  "components/cta/LeadForm.tsx",
  "components/cta/NewsletterForm.tsx",
  "components/cta/TalentPoolForm.tsx",
];

const TAG_PAGES = [
  "app/[lang]/work/page.tsx",
  "app/[lang]/work/[slug]/page.tsx",
  "app/[lang]/services/[slug]/page.tsx",
];

describe("Phase 3: forms, tags, cards, icons from @cyberskill/design", () => {
  it("drops unused in-repo Field/Select/Dialog/Card primitives", () => {
    for (const name of ["Field", "Select", "Dialog", "Card"]) {
      expect(existsSync(resolve(root, `components/ui/${name}.tsx`)), name).toBe(false);
    }
    expect(existsSync(resolve(root, "lib/icons/index.ts"))).toBe(false);
  });

  it("Lead/Newsletter/TalentPool forms import package field controls", () => {
    for (const rel of FORM_FILES) {
      const text = readFileSync(resolve(root, rel), "utf8");
      expect(text, rel).toMatch(/from "@\/lib\/design-system\/forms"/);
      expect(text, rel).toMatch(/\bTextField\b/);
      // No hand-rolled .cs-field wrappers left in the form bodies.
      expect(text, rel).not.toMatch(/className="cs-field"/);
      expect(text, rel).not.toMatch(/className="cs-field /);
    }
    const lead = readFileSync(resolve(root, FORM_FILES[0]), "utf8");
    expect(lead).toMatch(/\bSelect\b/);
    expect(lead).toMatch(/\bTextarea\b/);
    expect(lead).toMatch(/\bCheckbox\b/);
    const talent = readFileSync(resolve(root, FORM_FILES[2]), "utf8");
    expect(talent).toMatch(/\bSelect\b/);
  });

  it("work/services keyword chips use the package Tag", () => {
    for (const rel of TAG_PAGES) {
      const text = readFileSync(resolve(root, rel), "utf8");
      expect(text, rel).toMatch(/from "@\/lib\/design-system\/tag"/);
      expect(text, rel).toMatch(/<Tag[\s>]/);
      expect(text, rel).not.toMatch(/className="cs-tag"/);
      expect(text, rel).not.toMatch(/className="cs-tag /);
    }
  });

  it("Icon comes from the package re-export", () => {
    const icon = readFileSync(resolve(root, "lib/design-system/icon.tsx"), "utf8");
    expect(icon).toMatch(/from "@cyberskill\/design"/);
    const ui = readFileSync(resolve(root, "components/ui/Icon.tsx"), "utf8");
    expect(ui).toMatch(/from "@\/lib\/design-system\/icon"/);
  });

  it("no production source invents local field/tag chrome that the package owns", () => {
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    // Package owns .cs-field layout + .cs-field__*; Lumi may only set dark
    // control fill and optional marker / newsletter row layout.
    expect(css).not.toMatch(/^\.cs-field\s*\{/m);
    expect(css).not.toMatch(/^\.cs-field label\s*\{/m);
    expect(css).not.toMatch(/^\.cs-tag\s*\{/m);
    expect(css).toMatch(/\[data-theme="dark"\]\s*\.cs-field__control/);
    expect(css).toMatch(/\.cs-tag-row/);
  });

  it("keeps genie message rows and prompt local (ChatMessage/PromptInput do not map)", () => {
    const panel = readFileSync(resolve(root, "components/genie/GenieChatPanel.tsx"), "utf8");
    expect(panel).toMatch(/cs-genie-msg/);
    expect(panel).toMatch(/cs-genie-form/);
    expect(panel).not.toMatch(/ChatMessage/);
    expect(panel).not.toMatch(/PromptInput/);
  });

  it("ships a Phase 3 decision note and README pointer", () => {
    const note = readFileSync(
      resolve(root, "docs/decisions/2026-07-25-lumi-ds-phase3-forms-polish.md"),
      "utf8",
    );
    expect(note).toMatch(/Phase 3/);
    expect(note).toMatch(/TextField/);
    expect(note).toMatch(/Tag/);
    expect(note).toMatch(/ChatMessage/);
    expect(note).toMatch(/keep.?local/i);

    const readme = readFileSync(resolve(root, "README.md"), "utf8");
    expect(readme).toContain("2026-07-25-lumi-ds-phase3-forms-polish.md");
    expect(readme).not.toMatch(/Deferred: forms\/tags\/cards\/icons/);
  });

  it("production forms still keep analytics / honeypot wrappers", () => {
    const lead = readFileSync(resolve(root, FORM_FILES[0]), "utf8");
    expect(lead).toMatch(/react-hook-form/);
    expect(lead).toMatch(/honeypot|website/i);
    expect(lead).toMatch(/emit\(/);
    for (const file of sourceFiles().filter((f) => FORM_FILES.some((rel) => f.endsWith(rel)))) {
      const text = readFileSync(file, "utf8");
      expect(text).toMatch(/clarity-mask|cs-visually-hidden|honeypot/i);
    }
  });
});
