import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  clientPermissions,
  teamConsents,
  findPermission,
  requirePermission,
} from "@/lib/content/permissions";
import {
  team,
  aboutStory,
  aboutCulture,
  testimonials,
  clientLogos,
  work,
  caseStudyDetails,
} from "@/lib/content/site";
import TeamPage from "@/app/[lang]/team/page";

describe("docs/permission-request-drafts", () => {
  it("EN and VN permission request drafts exist and cover required asks", () => {
    const en = path.join(
      process.cwd(),
      "docs/content/permission-request-en.md",
    );
    const vi = path.join(
      process.cwd(),
      "docs/content/permission-request-vi.md",
    );
    expect(fs.existsSync(en)).toBe(true);
    expect(fs.existsSync(vi)).toBe(true);
    const enText = fs.readFileSync(en, "utf8");
    const viText = fs.readFileSync(vi, "utf8");
    for (const t of [enText, viText]) {
      expect(t.toLowerCase()).toMatch(/logo/);
      expect(t.toLowerCase()).toMatch(/quote|trích dẫn/);
      expect(t).toMatch(/industry|ngành/i);
      expect(t.length).toBeGreaterThan(200);
    }
  });
});

describe("content/team-consent", () => {
  it("every published team member has a matching consent record", () => {
    expect(team.length).toBeGreaterThan(0);
    for (const m of team) {
      expect(m.consentId).toBeTruthy();
      const rec = findPermission(m.consentId, teamConsents);
      expect(rec, `missing consent for ${m.id}`).toBeDefined();
      expect(rec!.scopes).toContain("team_profile");
      expect(rec!.grantedBy.trim().length).toBeGreaterThan(0);
      expect(rec!.grantedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(rec!.reference.trim().length).toBeGreaterThan(0);
      // No placeholder role-only names
      expect(m.name.toLowerCase()).not.toBe("senior engineer");
      expect(m.role.en.trim().length).toBeGreaterThan(0);
      expect(m.role.vi.trim().length).toBeGreaterThan(0);
      expect(m.bio.en.trim().length).toBeGreaterThan(0);
      expect(m.bio.vi.trim().length).toBeGreaterThan(0);
    }
  });

  it("requirePermission throws for unknown ids", () => {
    expect(() => requirePermission("nope", teamConsents)).toThrow(/No permission/);
  });
});

describe("content/testimonial-permission", () => {
  it("every proof asset in the repo has a matching permission record", () => {
    testimonials.forEach((t) => {
      expect(t.permission).toBeDefined();
      expect(t.permission?.grantedBy).toBeTruthy();
      expect(t.permission?.grantedAt).toBeTruthy();
      expect(t.permission?.reference).toBeTruthy();
    });
    clientLogos.forEach((l) => {
      expect(l.permission).toBeDefined();
      expect(l.permission?.grantedBy).toBeTruthy();
      expect(l.permission?.grantedAt).toBeTruthy();
      expect(l.permission?.reference).toBeTruthy();
    });
    // Case studies / work items must resolve permissionId in the ledger
    expect(clientPermissions.length).toBeGreaterThanOrEqual(3);
    for (const w of work) {
      expect(w.permissionId, `work ${w.slug}`).toBeTruthy();
      expect(findPermission(w.permissionId!, clientPermissions)).toBeDefined();
    }
    for (const c of caseStudyDetails) {
      expect(c.permissionId, `case ${c.slug}`).toBeTruthy();
      expect(findPermission(c.permissionId!, clientPermissions)).toBeDefined();
    }
  });
});

describe("content/about-team-shape", () => {
  it("story, culture, and team render from the shared source in both locales", async () => {
    for (const locale of ["en", "vi"] as const) {
      expect(aboutStory.title[locale].trim().length).toBeGreaterThan(0);
      expect(aboutStory.body[locale].trim().length).toBeGreaterThan(0);
      expect(aboutCulture.title[locale].trim().length).toBeGreaterThan(0);
      expect(aboutCulture.points.length).toBeGreaterThan(0);
      for (const p of aboutCulture.points) {
        expect(p[locale].trim().length).toBeGreaterThan(0);
      }

      const page = await TeamPage({
        params: Promise.resolve({ lang: locale }),
      });
      const html = renderToStaticMarkup(page);
      expect(html).toContain('data-about-team=""');
      expect(html).toContain('data-about-story=""');
      expect(html).toContain('data-about-culture=""');
      expect(html).toContain(aboutStory.title[locale]);
      expect(html).toContain(aboutCulture.points[0]![locale].slice(0, 20));

      // name + role only is valid (founder has no photo)
      if (team.length > 0) {
        expect(html).toContain(team[0]!.name);
        expect(html).toContain(team[0]!.role[locale]);
        expect(html).toContain(`data-consent-id="${team[0]!.consentId}"`);
      }

      // Recruiting link without hardcoded job titles
      expect(html).toContain(`/${locale}/careers`);
      expect(html).toContain('data-careers-link=""');
      expect(html.toLowerCase()).not.toMatch(/senior backend engineer openings/);
    }
  });
});

describe("content/vi-key-parity (team/about)", () => {
  it("about and team localized strings have both en and vi", () => {
    for (const m of team) {
      expect(m.role.vi.trim().length).toBeGreaterThan(0);
      expect(m.bio.vi.trim().length).toBeGreaterThan(0);
    }
    expect(aboutStory.title.vi.trim().length).toBeGreaterThan(0);
    expect(aboutStory.body.vi.trim().length).toBeGreaterThan(0);
  });
});

describe("lint/no-hardcoded-copy", () => {
  it("team page careers CTA uses dictionary careersCta, not hardcoded job ads", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "app/[lang]/team/page.tsx"),
      "utf8",
    );
    expect(src).toContain("dict.sections.careersCta");
    expect(src).toContain("/careers");
  });
});
