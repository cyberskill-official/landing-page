---
id: FR-A11Y-011
title: "Public /accessibility compliance page — WCAG 2.2 AA statement, criteria coverage, contact for complaints"
module: A11Y
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: A11Y Lead + Founder
created: 2026-05-16
related_frs: [FR-A11Y-001, FR-A11Y-002, FR-A11Y-003, FR-A11Y-004, FR-A11Y-005, FR-A11Y-006, FR-A11Y-007, FR-A11Y-008, FR-A11Y-009, FR-A11Y-010, FR-A11Y-012, FR-WEB-008, FR-CMS-007]
depends_on: [FR-A11Y-001, FR-WEB-008]
blocks: [FR-A11Y-012]
language: typescript 5.6 + react 19 + next 15
service: apps/web/app/accessibility/
new_files:
  - apps/web/app/accessibility/page.tsx
  - apps/web/app/accessibility/[locale]/page.tsx
  - apps/web/components/accessibility/CriteriaTable.tsx
  - apps/web/components/accessibility/__tests__/CriteriaTable.unit.test.tsx
  - content/accessibility/criteria.json

source_pages:
  - docs/01-master-plan-v2.md §7.6 — "Public a11y compliance page"
  - WCAG 2.2 AA criteria list
  - EN 301 549 European a11y standard
  - ADA Title III + Section 508 references

effort_hours: 6
risk_if_skipped: "Public a11y page is the trust signal + legal documentation. Without it: enterprise customers can't verify compliance for procurement. Section 508 / EN 301 549 audits fail. Lawsuit defense weakens (we can't claim compliance without public statement)."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship `/accessibility` route with WCAG 2.2 AA compliance statement.
2. **MUST** list each AA criterion + how the site meets it (or notes if partial) + how to report issues.
3. **MUST** include contact info for accessibility complaints: dedicated email `accessibility@cyberskill.world`.
4. **MUST** be itself accessible (axe-clean, semantic HTML, headings hierarchy).
5. **MUST** be available in both English (`/accessibility`) and Vietnamese (`/vi/accessibility`).
6. **MUST** include:
   - Date of last audit (FR-A11Y-012 audit results).
   - Standard claimed (WCAG 2.2 AA).
   - Conformance status (Full compliance / Partial / Non-compliance per area).
   - Tested with screen readers: VoiceOver, NVDA.
   - Tested with keyboard-only navigation.
   - Tested with reduced-motion preferences.
   - Tested with low-bandwidth / low-memory devices.
7. **MUST** structure content per EN 301 549 § 12.1 (Accessibility Statement) recommended template.
8. **MUST** include "Known issues" section listing any pending a11y bugs (transparency).
9. **MUST** include "Last reviewed" timestamp, updated quarterly minimum.
10. **MUST** be linked from footer (FR-SCENE-018) of every page.
11. **MUST** be axe-clean per FR-OPS-012.
12. **MUST** integrate with FR-CMS-007 locale switcher.

## §2 — Why this design

**Why public a11y page?** Legal requirement in EU (EN 301 549) + many US states. Enterprise procurement requires.

**Why per-criterion listing?** Generic "we're WCAG compliant" is hollow. Per-criterion shows we did the work + lets auditors verify quickly.

**Why dedicated email?** Centralizes complaints; signals seriousness. info@cyberskill.world muddied with other types.

**Why known-issues transparency?** Honesty builds trust. Hiding issues = legal liability when found.

**Why quarterly review?** A11y regresses with code changes. Quarterly is the floor; more frequent in active development phases.

**Why both EN + VI?** Vietnamese users with disabilities deserve a11y statement in their language.

## §3 — Public surface

```tsx
// apps/web/app/accessibility/page.tsx
import { CriteriaTable } from "@/components/accessibility/CriteriaTable";
import criteriaData from "@/content/accessibility/criteria.json";
import { getTranslations } from "next-intl/server";

export const revalidate = 86400;  // 24h

export async function generateMetadata() {
  const t = await getTranslations("accessibility");
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function AccessibilityPage() {
  const t = await getTranslations("accessibility");

  return (
    <article aria-labelledby="a11y-title">
      <h1 id="a11y-title">{t("page_title")}</h1>
      <p>{t("intro")}</p>

      <section aria-labelledby="commitment">
        <h2 id="commitment">Our commitment</h2>
        <p>We aim for full conformance with WCAG 2.2 AA on this site.</p>
        <ul>
          <li>Standard claimed: <strong>WCAG 2.2 Level AA</strong></li>
          <li>Last audited: 2026-05-15 (see FR-A11Y-012)</li>
          <li>Conformance status: <strong>Full</strong> (with known exceptions documented below)</li>
        </ul>
      </section>

      <section aria-labelledby="tested-with">
        <h2 id="tested-with">Tested with</h2>
        <ul>
          <li>VoiceOver on macOS Safari + iOS Safari</li>
          <li>NVDA on Windows Firefox + Chrome</li>
          <li>Keyboard-only navigation (no mouse)</li>
          <li>prefers-reduced-motion enabled</li>
          <li>Low-bandwidth + Save-Data mode</li>
          <li>Mobile devices ≥ 320 px width</li>
        </ul>
      </section>

      <section aria-labelledby="criteria">
        <h2 id="criteria">WCAG 2.2 AA criteria coverage</h2>
        <CriteriaTable criteria={criteriaData} />
      </section>

      <section aria-labelledby="known-issues">
        <h2 id="known-issues">Known issues</h2>
        <ul>
          {/* Document any pending bugs */}
          <li>No known unresolved issues at this time.</li>
        </ul>
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact">Reporting an issue</h2>
        <p>If you encounter an accessibility barrier on this site, please contact:</p>
        <address>
          <a href="mailto:accessibility@cyberskill.world">accessibility@cyberskill.world</a>
        </address>
        <p>We aim to respond within 5 business days.</p>
      </section>

      <p className="last-reviewed">Last reviewed: 2026-05-16. Reviewed quarterly.</p>
    </article>
  );
}
```

```tsx
// apps/web/components/accessibility/CriteriaTable.tsx
interface Criterion {
  id: string;      // e.g., "1.4.3"
  name: string;
  level: "A" | "AA" | "AAA";
  status: "full" | "partial" | "n/a";
  notes: string;
  fr_refs: string[];  // e.g., ["FR-A11Y-008"]
}

export function CriteriaTable({ criteria }: { criteria: Criterion[] }) {
  return (
    <table>
      <caption>WCAG 2.2 AA criteria conformance</caption>
      <thead>
        <tr>
          <th scope="col">SC</th>
          <th scope="col">Name</th>
          <th scope="col">Level</th>
          <th scope="col">Status</th>
          <th scope="col">Notes</th>
        </tr>
      </thead>
      <tbody>
        {criteria.map(c => (
          <tr key={c.id}>
            <td><code>{c.id}</code></td>
            <td>{c.name}</td>
            <td>{c.level}</td>
            <td>
              <span className={`status-${c.status}`}>
                {c.status === "full" && "✅ Full"}
                {c.status === "partial" && "⚠️ Partial"}
                {c.status === "n/a" && "—"}
              </span>
            </td>
            <td>{c.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

```json
// content/accessibility/criteria.json (excerpt)
[
  { "id": "1.1.1", "name": "Non-text Content", "level": "A", "status": "full", "notes": "Canvas has shadow-DOM mirror (FR-A11Y-002); all images have alt text.", "fr_refs": ["FR-A11Y-002"] },
  { "id": "1.4.3", "name": "Contrast (Minimum)", "level": "AA", "status": "full", "notes": "Palette verified ≥ 4.5:1 (FR-DS-002).", "fr_refs": ["FR-DS-002", "FR-A11Y-008"] },
  { "id": "2.1.1", "name": "Keyboard", "level": "A", "status": "full", "notes": "All functionality operable via keyboard (FR-A11Y-007).", "fr_refs": ["FR-A11Y-007"] },
  { "id": "2.4.1", "name": "Bypass Blocks", "level": "A", "status": "full", "notes": "Skip-story pill is first focusable (FR-A11Y-003).", "fr_refs": ["FR-A11Y-003"] },
  { "id": "2.5.5", "name": "Target Size (Enhanced)", "level": "AAA", "status": "full", "notes": "All interactives ≥ 44×44 (FR-A11Y-009).", "fr_refs": ["FR-A11Y-009"] },
  { "id": "3.3.7", "name": "Redundant Entry", "level": "A", "status": "full", "notes": "Form data carries across CTAs (FR-A11Y-010).", "fr_refs": ["FR-A11Y-010"] },
  { "id": "4.1.3", "name": "Status Messages", "level": "AA", "status": "full", "notes": "aria-live regions for narration + form feedback (FR-A11Y-002, FR-CTA-005).", "fr_refs": ["FR-A11Y-002"] }
  // ... full WCAG 2.2 AA list
]
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Route renders at /accessibility | curl 200 |
| 2 | axe-clean | AxeBuilder |
| 3 | All WCAG 2.2 AA criteria listed in criteria.json | JSON count |
| 4 | Contact info present | grep |
| 5 | Vietnamese variant at /vi/accessibility | Visit |
| 6 | Last reviewed timestamp present | DOM |
| 7 | Linked from footer | FR-SCENE-018 inspection |
| 8 | Vitest unit tests on CriteriaTable | pnpm vitest |
| 9 | Lighthouse a11y score 100 on this page | FR-OPS-011 |
| 10 | Each criterion has fr_refs pointing to implementing FR | JSON inspection |

## §5 — Verification

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CriteriaTable } from "../CriteriaTable";

describe("CriteriaTable", () => {
  const sample = [
    { id: "1.4.3", name: "Contrast", level: "AA" as const, status: "full" as const, notes: "Test", fr_refs: ["FR-A11Y-008"] },
  ];

  it("renders criteria rows", () => {
    render(<CriteriaTable criteria={sample} />);
    expect(screen.getByText("1.4.3")).toBeTruthy();
    expect(screen.getByText("Contrast")).toBeTruthy();
  });

  it("status icon for full coverage", () => {
    render(<CriteriaTable criteria={sample} />);
    expect(screen.getByText(/Full/)).toBeTruthy();
  });

  it("table has caption", () => {
    render(<CriteriaTable criteria={sample} />);
    expect(screen.getByText(/WCAG 2.2 AA criteria conformance/)).toBeTruthy();
  });
});
```

## §6 — Dependencies

**Concept:** All FR-A11Y-* (this page documents them), FR-CMS-007 (locale), FR-WEB-008 (Sanity not strictly needed; criteria are static).

**Operational:** Next.js 15 App Router, next-intl.

**Downstream:** FR-A11Y-012 audit results land here; FR-SCENE-018 footer links to.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Stale claims after later changes | AC#6 | Re-audit + update last-reviewed quarterly |
| Contact email bounces | Email forward setup | Verify accessibility@ → routes to founder + support |
| WCAG 2.2 criteria list incomplete | AC#3 | Source from W3C; cross-check |
| Page itself fails axe | AC#2 | Standard a11y review; ensure semantic HTML |
| Vietnamese translation missing | AC#5 | next-intl warns; fallback to English |
| Footer link broken | AC#7 | FR-SCENE-018 includes link |
| Status claims overstated | Manual audit | Hold to "Full" only after verified; otherwise "Partial" |
| Criteria.json stale | Quarterly review | Add to release checklist |
| Mobile responsive breaks | Visual | Standard responsive design |
| RTL languages future | Not in slice 1 | Document constraint |

## §8 — Deliverable preview

User visits /accessibility:
- H1: "Accessibility statement — CyberSkill"
- Intro paragraph.
- Tested with section: SR readers, keyboard, reduced motion, low-bandwidth.
- Criteria table: 50+ rows of WCAG 2.2 AA criteria with ✅/⚠️ status.
- Known issues: empty or transparent list.
- Contact: accessibility@cyberskill.world.
- Footer: "Last reviewed: 2026-05-16. Reviewed quarterly."

Enterprise procurement officer:
- Reviews page; confirms WCAG 2.2 AA conformance.
- Checks specific SC their org requires.
- Sees fr_refs link to implementation FRs (transparency).

## §9 — Notes

**On EN 301 549 template:** EU public-sector + many private orgs require this exact structure. Following template = passes enterprise audits.

**On Section 508:** US federal compliance. Similar structure; can link.

**On Vietnamese a11y law:** Vietnam ratified UN CRPD; no specific a11y law yet but cultural expectation. Vietnamese page demonstrates respect.

**On future automation:** Could auto-generate criteria.json from FR documents (each FR-A11Y-* has fr_refs). Slice 2 enhancement.

*End of FR-A11Y-011.*
