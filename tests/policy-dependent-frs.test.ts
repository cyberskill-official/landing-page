// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { act } from "react";
import path from "node:path";
import fs from "node:fs";

import { commercialPolicy, getPublishableCapacity, isPolicyStale } from "@/lib/content/policy";
import { previousCtaPrimary, ctaCopyHistory } from "@/lib/content/cta-history";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CapacityLine } from "@/components/sections/CapacityLine";
import { EngagementModels } from "@/components/sections/EngagementModels";
import {
  VerifyUs,
  ENGINEERING_CLAIMS,
  verifyUsEngineeringGates,
} from "@/components/sections/VerifyUs";
import { Partnership } from "@/components/sections/Partnership";
import { Hero } from "@/components/sections/Hero";
import { ContactCta } from "@/components/sections/ContactCta";
import { mapLeadToCrm } from "@/lib/lead/crm-mapping";
import type { LeadInput } from "@/lib/lead/schema";
import * as taxonomy from "@/lib/analytics/taxonomy";

const enDict = getDictionary("en");
const viDict = getDictionary("vi");

describe("content/cta-copy", () => {
  it("both locales render the approved outcome promise from the commercial policy", () => {
    expect(enDict.hero.ctaPrimary).toBe(commercialPolicy.ctaPromise.en);
    expect(viDict.hero.ctaPrimary).toBe(commercialPolicy.ctaPromise.vi);

    const enHero = renderToStaticMarkup(
      createElement(Hero, { locale: "en", dict: enDict }),
    );
    const viHero = renderToStaticMarkup(
      createElement(Hero, { locale: "vi", dict: viDict }),
    );
    expect(enHero).toContain(commercialPolicy.ctaPromise.en);
    expect(viHero).toContain(commercialPolicy.ctaPromise.vi);

    // Contact band also sources the same dictionary promise (FR-CTA-015 §1.1).
    const contactSrc = fs.readFileSync(
      path.join(process.cwd(), "components/sections/ContactCta.tsx"),
      "utf8",
    );
    expect(contactSrc).toContain("dict.hero.ctaPrimary");
    expect(contactSrc).toContain('location="contact-section"');
  });

  it("keeps previous CTA strings retrievable for one-commit rollback", () => {
    expect(previousCtaPrimary.en).toBe("Start my project");
    expect(previousCtaPrimary.vi).toBe("Bắt đầu dự án");
    expect(ctaCopyHistory.length).toBeGreaterThan(0);
    expect(ctaCopyHistory[0]!.primary.en).toBe(previousCtaPrimary.en);
    // Live dictionary must not still be the action-only label
    expect(enDict.hero.ctaPrimary).not.toBe(previousCtaPrimary.en);
  });
});

describe("content/no-placeholders (policy dependents)", () => {
  it("CTA promise and engagement ranges come from the shipped policy SSOT", () => {
    expect(enDict.hero.ctaPrimary).toBe(commercialPolicy.ctaPromise.en);
    for (const m of commercialPolicy.engagementModels) {
      expect(m.range.en).not.toMatch(/TBD|TODO|FOR REVIEW|placeholder|\$X\b/i);
      expect(m.range.vi.trim().length).toBeGreaterThan(0);
    }
    expect(commercialPolicy.partnershipOffer.en).not.toMatch(/TBD|TODO|placeholder/i);
    expect(commercialPolicy.heroAudience.en.trim().length).toBeGreaterThan(0);
  });
});

describe("content/capacity-line", () => {
  it("renders capacity from the commercial policy in both locales", () => {
    const en = renderToStaticMarkup(createElement(CapacityLine, { locale: "en" }));
    const vi = renderToStaticMarkup(createElement(CapacityLine, { locale: "vi" }));
    expect(en).toContain(String(commercialPolicy.capacity.projectsPerQuarter));
    expect(en).toContain(commercialPolicy.capacity.nextOpenSlot.en);
    expect(en).toContain(commercialPolicy.decidedOn);
    expect(en).toContain('data-capacity-line=""');
    expect(vi).toContain(commercialPolicy.capacity.nextOpenSlot.vi);
    expect(vi).toContain(String(commercialPolicy.capacity.projectsPerQuarter));
  });

  it("renders nothing when policy is stale", () => {
    const html = renderToStaticMarkup(
      createElement(CapacityLine, {
        locale: "en",
        asOf: "2027-01-01",
      }),
    );
    expect(html).toBe("");
    expect(getPublishableCapacity(commercialPolicy, "2027-01-01")).toBeNull();
    expect(isPolicyStale(commercialPolicy, "2027-01-01")).toBe(true);
  });
});

describe("content/commercial-policy-record", () => {
  it("capacity line values equal the owner's recorded numbers with review date", () => {
    expect(commercialPolicy.capacity.projectsPerQuarter).toBe(3);
    expect(commercialPolicy.capacity.nextOpenSlot.en).toBe("Q4 2026");
    expect(commercialPolicy.decidedOn).toBe("2026-07-14");
    const html = renderToStaticMarkup(createElement(CapacityLine, { locale: "en" }));
    expect(html).toContain('data-decided-on="2026-07-14"');
    expect(html).toContain('data-projects-per-quarter="3"');
  });
});

describe("content/engagement-models", () => {
  it("renders every policy model with five fields in both locales", () => {
    for (const locale of ["en", "vi"] as const) {
      const html = renderToStaticMarkup(
        createElement(EngagementModels, { locale }),
      );
      expect(html).toContain('data-engagement-models=""');
      expect(html).toContain('id="engagement"');
      for (const m of commercialPolicy.engagementModels) {
        expect(html).toContain(m.name[locale]);
        expect(html).toContain(m.range[locale]);
        expect(html).toContain(m.timeline[locale]);
      }
      expect(html).toContain('data-field="what"');
      expect(html).toContain('data-field="fits"');
      expect(html).toContain('data-field="range"');
      expect(html).toContain('data-field="timeline"');
      expect(html).toMatch(/Talk about this model|Trao đổi về mô hình này/);
    }
  });

  it("service pages and FAQ link to the engagement section", () => {
    const servicesSrc = fs.readFileSync(
      path.join(process.cwd(), "components/sections/Services.tsx"),
      "utf8",
    );
    const detailSrc = fs.readFileSync(
      path.join(process.cwd(), "app/[lang]/services/[slug]/page.tsx"),
      "utf8",
    );
    const siteSrc = fs.readFileSync(
      path.join(process.cwd(), "lib/content/site.ts"),
      "utf8",
    );
    expect(servicesSrc).toContain("#engagement");
    expect(detailSrc).toContain("#engagement");
    expect(siteSrc).toContain("engagement models");
    expect(siteSrc).toContain("/#engagement");
  });
});

describe("content/verify-us-placement", () => {
  it("is footer-adjacent and on how-we-build, not stacked twice on the home page", () => {
    const home = fs.readFileSync(
      path.join(process.cwd(), "app/[lang]/page.tsx"),
      "utf8",
    );
    const footer = fs.readFileSync(
      path.join(process.cwd(), "components/footer/SiteFooter.tsx"),
      "utf8",
    );
    const how = fs.readFileSync(
      path.join(process.cwd(), "app/[lang]/how-we-build/page.tsx"),
      "utf8",
    );
    // FR-CMS-014: footer-adjacent + how-we-build — home must not add a third copy.
    expect(home).not.toMatch(/<VerifyUs\b/);
    expect(footer).toMatch(/<VerifyUs\b/);
    expect(how).toMatch(/<VerifyUs\b/);
  });
});

describe("content/verify-us-block", () => {
  it("renders every configured field in both locales", () => {
    for (const locale of ["en", "vi"] as const) {
      const html = renderToStaticMarkup(
        createElement(VerifyUs, { locale }),
      );
      expect(html).toContain('data-verify-us=""');
      expect(html).toContain('data-field="legalName"');
      expect(html).toContain('data-field="founded"');
      expect(html).toContain('data-field="duns"');
      expect(html).toContain(commercialPolicy.registrationNumber);
      expect(html).toContain('data-field="registrationNumber"');
      expect(html).toContain('data-field="address"');
      expect(html).toContain('data-static-map-link=""');
      expect(html).toContain("/brand/office-map.svg");
      expect(html).toContain('data-field="repository"');
    }
  });

  it("omits registration when unset via synthetic asOf that is still fresh but we test empty path", () => {
    // When policy is stale, registration helper returns null — block still renders other facts
    // but registration field must not appear as empty when getPublishableRegistrationNumber is null.
    // Stale asOf: component still shows legal/DUNS (company facts) but registration uses helper.
    const html = renderToStaticMarkup(
      createElement(VerifyUs, { locale: "en", asOf: "2027-01-01" }),
    );
    // Registration number must not appear when past review cadence
    expect(html).not.toContain(commercialPolicy.registrationNumber);
    expect(html).not.toContain('data-field="registrationNumber"');
  });
});

describe("content/gates-claims-parity", () => {
  it("each engineering claim maps to an exact CI command/evidence token, not a loose substring", () => {
    const ci = fs.readFileSync(
      path.join(process.cwd(), ".github/workflows/ci.yml"),
      "utf8",
    );
    expect(ENGINEERING_CLAIMS.length).toBeGreaterThanOrEqual(4);
    expect(verifyUsEngineeringGates).toEqual(
      ENGINEERING_CLAIMS.map((c) => c.gate),
    );

    for (const claim of ENGINEERING_CLAIMS) {
      // Exact command / path token required in ci.yml (avoids "verify" matching
      // unrelated prose, or mapping "code review" → static verify script).
      expect(
        ci.includes(claim.ciCommand),
        `CI must contain exact command "${claim.ciCommand}" for claim "${claim.en}"`,
      ).toBe(true);

      // Claim copy must not invent unenforced practices
      expect(claim.en.toLowerCase()).not.toMatch(/code review on every change/);
      expect(claim.en.toLowerCase()).not.toMatch(/pdpl/);
    }

    // Rendered block carries the CI command for audit
    const html = renderToStaticMarkup(createElement(VerifyUs, { locale: "en" }));
    for (const claim of ENGINEERING_CLAIMS) {
      expect(html).toContain(`data-ci-command="${claim.ciCommand}"`);
      expect(html).toContain(claim.en);
    }
  });
});

describe("headers/csp-clean-crawl", () => {
  it("verify-us map is a static first-party image link with no iframe or third-party script", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/sections/VerifyUs.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/<iframe/i);
    expect(src).not.toMatch(/maps\.googleapis\.com\/maps\/api\/js/);
    expect(src).toContain("/brand/office-map.svg");
    expect(src).toContain("data-static-map-link");
    const html = renderToStaticMarkup(createElement(VerifyUs, { locale: "en" }));
    expect(html).not.toMatch(/<iframe/i);
    expect(html).toContain('src="/brand/office-map.svg"');
  });
});

describe("content/partnership-shape", () => {
  it("renders every named partnership element in both locales", () => {
    for (const locale of ["en", "vi"] as const) {
      const dict = getDictionary(locale);
      const html = renderToStaticMarkup(
        createElement(Partnership, { locale, dict }),
      );
      expect(html).toContain('data-partnership-section=""');
      expect(html).toContain('data-field="offer"');
      expect(html).toContain(commercialPolicy.partnershipOffer[locale]);
      expect(html).toContain('data-field="capacity"');
      // Capacity bullet is distinct from the offer (not a rehash of partnershipOffer)
      const capacityMatch = html.match(
        /data-field="capacity"[^>]*>([^<]+)</,
      );
      expect(capacityMatch?.[1]).toBeTruthy();
      expect(capacityMatch![1]).not.toBe(commercialPolicy.partnershipOffer[locale]);
      expect(capacityMatch![1]).toContain(
        String(commercialPolicy.capacity.projectsPerQuarter),
      );
      expect(capacityMatch![1]).toContain(
        commercialPolicy.capacity.nextOpenSlot[locale],
      );
      expect(html).toContain('data-field="whiteLabel"');
      expect(html).toContain('data-field="timezone"');
      expect(html).toContain('data-field="ndaIp"');
      expect(html).toContain('data-field="howToStart"');
      expect(html).toContain('value="partnership"');
    }
  });
});

describe("api/lead-intent-routing", () => {
  it("partnership intent reaches the CRM payload as lead_intent", () => {
    const lead: LeadInput = {
      name: "Agency Lead",
      email: "partner@agency.example",
      company: "Studio Abroad",
      intent: "partnership",
      message: "Capacity ask",
      consent: true,
      locale: "en",
      source: "partnership",
      website: "",
    };
    const crm = mapLeadToCrm(lead);
    expect(crm.lead_intent).toBe("partnership");
    expect(crm.lead_source).toBe("partnership");
  });
});

describe("content/hero-subline", () => {
  it("SSR HTML includes the audience subline on both locales from the policy", () => {
    for (const locale of ["en", "vi"] as const) {
      const dict = getDictionary(locale);
      const html = renderToStaticMarkup(
        createElement(Hero, { locale, dict }),
      );
      expect(html).toContain('data-hero-subline=""');
      expect(html).toContain(commercialPolicy.heroAudience[locale]);
    }
  });
});

describe("analytics/both-lead-paths (cta_clicked location)", () => {
  beforeEach(() => {
    vi.spyOn(taxonomy, "emit").mockImplementation(() => {});
  });

  it("hero primary CTA click emits cta_clicked with location hero", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(createElement(Hero, { locale: "en", dict: enDict }));
    });
    const link = container.querySelector('a[href="/en#contact"]') as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    act(() => {
      link!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(taxonomy.emit).toHaveBeenCalledWith(
      "cta_clicked",
      expect.objectContaining({ location: "hero" }),
    );
    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
