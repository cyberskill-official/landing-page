// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { ValueProp } from "@/components/sections/ValueProp";
import { Marquee } from "@/components/sections/Marquee";
import { IntroVeil } from "@/components/motion/IntroVeil";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { SocialProof } from "@/components/sections/SocialProof";
import { TrustBand } from "@/components/sections/TrustBand";
import { Faq } from "@/components/sections/Faq";
import { Careers } from "@/components/sections/Careers";
import { SiteFooter } from "@/components/footer/SiteFooter";

// Automated axe checks (FR-A11Y-003). These run in the same vitest job the CI
// workflow already executes, so a11y regressions in the page's server-rendered
// sections fail the build. We render the SSR-safe sections into jsdom and run
// axe-core over the combined markup, which also catches cross-section issues
// (duplicate ids, heading order, list/label structure) - not just one component.
//
// Page-level rules (landmarks, single-main, document title, html-lang, bypass)
// and color-contrast are disabled here: they need a full document with real
// computed CSS, which a markup fragment in jsdom lacks. Those are covered by the
// manual pass and the live site. ContactCta is excluded because it uses
// next/image, which does not render outside the Next runtime.
const RULES_OFF = {
  region: { enabled: false },
  "landmark-one-main": { enabled: false },
  "landmark-unique": { enabled: false },
  "page-has-heading-one": { enabled: false },
  "document-title": { enabled: false },
  "html-has-lang": { enabled: false },
  bypass: { enabled: false },
  "color-contrast": { enabled: false },
} as const;

async function seriousViolations(locale: Locale): Promise<string[]> {
  const dict = getDictionary(locale);
  const sections: ReactNode[] = [
    createElement(IntroVeil, { locale }),
    createElement(Hero, { locale, dict }),
    createElement(TrustBand, { locale }),
    createElement(ValueProp, { locale, dict }),
    createElement(Marquee, { dict }),
    createElement(Services, { locale, dict }),
    createElement(Process, { locale, dict }),
    createElement(WorkPreview, { locale, dict }),
    createElement(SocialProof, { locale, dict }),
    createElement(Careers, { locale, dict }),
    createElement(Faq, { locale }),
    createElement(SiteFooter, { locale, dict }),
  ];
  const html = renderToStaticMarkup(createElement("main", null, ...sections));
  document.body.innerHTML = html;
  const results = await axe.run(document.body, { rules: RULES_OFF });
  // Only serious/critical fail the build (FR-A11Y-003 §1.2), reported with rule + count.
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} [${v.impact}]: ${v.nodes.length} node(s)`);
}

describe("axe accessibility checks on the page sections (FR-A11Y-003)", () => {
  it("English markup has no serious or critical axe violations", async () => {
    expect(await seriousViolations("en")).toEqual([]);
  });

  it("Vietnamese markup has no serious or critical axe violations", async () => {
    expect(await seriousViolations("vi")).toEqual([]);
  });
});
