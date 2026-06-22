// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Faq } from "@/components/sections/Faq";
import { TrustBand } from "@/components/sections/TrustBand";

// Automated axe checks (FR-A11Y-003). These run in the same vitest job the CI
// workflow already executes, so a11y regressions in these presentational
// components fail the build. We render server-rendered markup into jsdom and run
// axe-core over it. Page-level rules (landmarks, single-main, document title,
// html-lang, bypass) and color-contrast are disabled here because they need a
// full page and real computed CSS, which a markup fragment in jsdom lacks; those
// are covered by the manual pass and the live site, not this unit check.
const RULES_OFF = {
  region: { enabled: false },
  "landmark-one-main": { enabled: false },
  "page-has-heading-one": { enabled: false },
  "document-title": { enabled: false },
  "html-has-lang": { enabled: false },
  bypass: { enabled: false },
  "color-contrast": { enabled: false },
} as const;

async function violationIds(locale: Locale): Promise<string[]> {
  const dict = getDictionary(locale);
  const html = renderToStaticMarkup(
    createElement(
      "main",
      null,
      createElement(TrustBand, { locale }),
      createElement(Faq, { locale }),
      createElement(SiteFooter, { locale, dict }),
    ),
  );
  document.body.innerHTML = html;
  const results = await axe.run(document.body, { rules: RULES_OFF });
  return results.violations.map((v) => `${v.id}: ${v.nodes.length}`);
}

describe("axe accessibility checks on presentational components (FR-A11Y-003)", () => {
  it("English markup has no axe violations", async () => {
    expect(await violationIds("en")).toEqual([]);
  });

  it("Vietnamese markup has no axe violations", async () => {
    expect(await violationIds("vi")).toEqual([]);
  });
});
