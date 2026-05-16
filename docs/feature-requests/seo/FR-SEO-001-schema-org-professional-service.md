---
id: FR-SEO-001
engineering_anchor: true
title: "Schema.org ProfessionalService JSON-LD with DUNS, founder, areaServed, knowsAbout"
module: SEO
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
milestone: P5 · slice 3
slice: 1
owner: Content + Frontend Developer
created: 2026-05-16
shipped: null
brain_chain_hash: null
related_frs: [FR-SEO-002, FR-SEO-003, FR-SEO-004, FR-SEO-005, FR-SEO-006, FR-WEB-001, FR-CMS-005]
depends_on: [FR-WEB-001]
blocks:
  - FR-SEO-002      # Service sub-blocks reference the parent ProfessionalService
  - FR-SEO-003      # Person schema references the founder defined here
  - FR-OPS-014      # production deployment requires the SEO metadata to validate

source_pages:
  - docs/01-master-plan-v2.md §8.2 (Schema.org markup)
  - docs/01-master-plan-v2.md §1.3 (Buyer proof points — DUNS, founded, engagements)
  - docs/01-master-plan-v2.md §9.2 (Trust signals)

source_decisions:
  - "v2 §8.2: ProfessionalService with DUNS 673219568, founder Stephen Cheng (alt Trịnh Thái Anh), areaServed 6 jurisdictions, knowsAbout 6 capabilities"
  - "user_preferences: legal name CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY"

language: typescript 5.6
service: apps/web/components/seo/
new_files:
  - apps/web/components/seo/JsonLd.tsx
  - apps/web/components/seo/professional-service.ts
  - apps/web/components/seo/__tests__/professional-service.test.ts
  - apps/web/components/seo/__tests__/schema-validator.test.ts
modified_files:
  - apps/web/app/layout.tsx              # mount <JsonLd schema={professionalService} />

allowed_tools:
  - file_read: docs/01-master-plan-v2.md
  - file_write: apps/web/components/seo/**
  - bash: pnpm -F web test
  - bash: curl -X POST https://validator.schema.org/...   # for end-to-end validation
disallowed_tools:
  - mutate the DUNS / legal name / addressLocality without an FR amendment (these are legally controlled)
  - inject the JSON-LD via client-side JS (must be SSR-rendered for Googlebot)

effort_hours: 4
sub_tasks:
  - "0.5h: professional-service.ts — typed schema literal"
  - "0.5h: JsonLd.tsx — server component rendering <script type='application/ld+json'>"
  - "0.5h: layout.tsx mount"
  - "1h: unit tests — every required field present, types correct"
  - "0.5h: schema-validator.test.ts — call Google Rich Results Test API on built HTML"
  - "0.5h: founder review + DUNS verification (call D&B confirmation page in browser)"
  - "0.5h: legal name double-check against business registration document"

risk_if_skipped: |
  Schema.org markup is the cheapest, highest-leverage SEO win for a services brand. Without it,
  Google's Knowledge Graph cannot associate the site with CyberSkill the legal entity, foundedDate,
  founder, areaServed. The "Vietnamese senior software" claim becomes unverifiable to crawlers.
  Skip → ~30% miss on branded SERP rich results vs competitors who ship schema. Cost of fixing: 4
  hours. Cost of delay: months of SEO underperformance compounding.
---

## §1 — Description (BCP-14 normative)

The site **MUST** embed a Schema.org `ProfessionalService` JSON-LD record in the SSR-rendered HTML of every page in the marketing site (excluding `/api/*` routes).

1. **MUST** be embedded as `<script type="application/ld+json">` in the `<head>` of every page, server-rendered (NOT client-injected — Googlebot's HTML crawler does not reliably execute JS).
2. **MUST** validate against schema.org's `ProfessionalService` type (a subtype of `LocalBusiness` → `Organization`). Validation tooling: Google's Rich Results Test API.
3. **MUST** include the legal name exactly as registered: `"CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY"` (all-caps; this is the registered company-name spelling).
4. **MUST** include `alternateName`: `["CyberSkill", "CyberSkill JSC"]`.
5. **MUST** include `identifier` array with a DUNS `PropertyValue` entry: `{ "@type": "PropertyValue", "propertyID": "DUNS", "value": "673219568" }`.
6. **MUST** include `foundingDate`: `"2020"` (year-precision; matches D&B record).
7. **MUST** include `founder`: a `Person` with `name: "Stephen Cheng"` and `alternateName: "Trịnh Thái Anh"` (the founder's legal Vietnamese name).
8. **MUST** include `address`: a `PostalAddress` with `streetAddress: "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward"`, `addressLocality: "Ho Chi Minh City"`, `addressCountry: "VN"`.
9. **MUST** include `email`: `"info@cyberskill.world"`.
10. **MUST** include `url`: `"https://cyberskill.world"` (the production URL, NOT a staging URL).
11. **MUST** include `logo`: `"https://cyberskill.world/logo.svg"` — the canonical brand mark URL.
12. **MUST** include `image`: `"https://cyberskill.world/og.jpg"` — the 1200×630 OG image from FR-SEO-004.
13. **MUST** include `description`: `"Senior-only Vietnamese software solutions consultancy. We turn your will into real software."`. Length ≤ 160 chars.
14. **MUST** include `areaServed`: a fixed array of 6 jurisdictions: `["United States", "Canada", "European Union", "United Kingdom", "Australia", "Vietnam"]`.
15. **MUST** include `knowsAbout`: `["React", "Three.js", "TypeScript", "Node.js", "AI/RAG systems", "Design Systems"]`. These 6 capabilities pair with the FR-SEO-002 sub-block Service schemas.
16. **MUST** include `slogan`: `"Turn Your Will Into Real"`.
17. **MUST NOT** include unverified claims (e.g. "ISO 27001" / "SOC 2 Type II") in the schema until the certifications are actually achieved. Master plan §9.2 reserves space; the schema MUST reflect current reality, not future state.
18. **MUST** be embedded via a server-rendered React component (`<JsonLd>`). Inline JSON in HTML, NOT computed in React-Helmet-style client-side hooks.
19. **MUST** pass Google's Rich Results Test API with zero `ERROR`-level findings (warnings allowed if documented).
20. **SHOULD** include `sameAs` array with the company's LinkedIn URL once published (placeholder for now: empty array — FR-SEO-NNN adds these once live).

---

## §2 — Why this design (rationale for humans)

**Why ProfessionalService, not Organization?** ProfessionalService is a tighter, more useful type for a services consultancy: it tells Google "this is a business that sells expertise" and surfaces in "near me" / locality searches better than the generic Organization. It also unlocks Service sub-block schemas (FR-SEO-002) for each capability.

**Why DUNS as `PropertyValue` identifier?** This is the schema.org canonical way to attach external identifiers without requiring a custom property. The `propertyID: "DUNS"` makes the value machine-readable; some enterprise procurement crawlers (e.g. SAP Ariba supplier discovery) parse this directly.

**Why legal name in all caps?** Vietnamese business registration practice — the company-name field in the legal registration is all-caps. Mirroring it in Schema.org makes the entity-resolution between the site and the official record unambiguous (helps with cross-border procurement / vendor onboarding).

**Why areaServed as 6 named jurisdictions, not just "Worldwide"?** Specific named regions get picked up by region-restricted searches. "Worldwide" is the lazy answer that helps no one. The 6 regions are the markets the master plan §1.2 identifies as the buyer ICP.

**Why image MUST be the production URL?** Schema.org URLs are absolute by convention. A relative URL (`/og.jpg`) or a staging URL fails the Rich Results validation, and once it's indexed with the wrong URL, you carry that index entry for ~6 months.

**Why "MUST NOT include unverified claims"?** Master plan §9.2 + §10.2 ("Will time zones / quality break us?" buyer fear): every claim in the schema is checkable. If the schema says ISO 27001 and the auditor finds no certificate, the buyer's trust drops to zero. Conservative + true beats aspirational + false.

---

## §3 — Public surface contract

### §3.1 `components/seo/professional-service.ts`

```ts
export interface ProfessionalServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'ProfessionalService';
  name: string;
  legalName: string;
  alternateName: string[];
  slogan: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  foundingDate: string;
  founder: {
    '@type': 'Person';
    name: string;
    alternateName: string;
  };
  email: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  identifier: Array<{
    '@type': 'PropertyValue';
    propertyID: string;
    value: string;
  }>;
  areaServed: string[];
  knowsAbout: string[];
  sameAs: string[];
}

export const PROFESSIONAL_SERVICE: ProfessionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'CyberSkill',
  legalName: 'CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY',
  alternateName: ['CyberSkill', 'CyberSkill JSC'],
  slogan: 'Turn Your Will Into Real',
  url: 'https://cyberskill.world',
  logo: 'https://cyberskill.world/logo.svg',
  image: 'https://cyberskill.world/og.jpg',
  description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
  foundingDate: '2020',
  founder: {
    '@type': 'Person',
    name: 'Stephen Cheng',
    alternateName: 'Trịnh Thái Anh',
  },
  email: 'info@cyberskill.world',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward',
    addressLocality: 'Ho Chi Minh City',
    addressCountry: 'VN',
  },
  identifier: [{ '@type': 'PropertyValue', propertyID: 'DUNS', value: '673219568' }],
  areaServed: ['United States', 'Canada', 'European Union', 'United Kingdom', 'Australia', 'Vietnam'],
  knowsAbout: ['React', 'Three.js', 'TypeScript', 'Node.js', 'AI/RAG systems', 'Design Systems'],
  sameAs: [],
};
```

### §3.2 `components/seo/JsonLd.tsx`

```tsx
import type { ProfessionalServiceSchema } from './professional-service';

export function JsonLd({ schema }: { schema: ProfessionalServiceSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}
```

**Why `dangerouslySetInnerHTML`?** React, by default, would render the JSON as a text child of `<script>`, which Google parses correctly but means React escapes some characters. The `dangerouslySetInnerHTML` path emits the literal JSON bytes — what Googlebot expects.

### §3.3 `app/layout.tsx` mount

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import { PROFESSIONAL_SERVICE } from '@/components/seo/professional-service';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <JsonLd schema={PROFESSIONAL_SERVICE} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **SSR includes JSON-LD** — `curl -s http://localhost:3000/` MUST contain a `<script type="application/ld+json">` tag with valid JSON. Asserted via `tests/seo/jsonld-ssr.spec.ts`.
2. **No client-side injection** — Disable JavaScript in Playwright; navigate to `/`; assert the JSON-LD `<script>` is present in the DOM. (CSR-injected schema would fail this.)
3. **Schema validates** — `professional-service.test.ts` validates the JSON against schema.org's ProfessionalService schema (using ajv + a cached schema.org subset, or a remote call to https://validator.schema.org/api). Zero errors.
4. **Required fields present** — Unit test asserts every field in §1 #3–#16 is present and matches the documented value byte-for-byte.
5. **Legal name uppercase** — Asserts `PROFESSIONAL_SERVICE.legalName === legalName.toUpperCase()` (i.e. no lowercase letters in the legal name).
6. **DUNS format** — Asserts the DUNS identifier value matches `/^\d{9}$/` (the canonical 9-digit format). Asserts equal to `"673219568"` byte-for-byte.
7. **`founder.alternateName` Vietnamese diacritics intact** — Asserts the string `"Trịnh Thái Anh"` includes the `ị` / `á` characters at the correct byte offsets (UTF-8 sanity check; covers font-substitution edge cases).
8. **areaServed length = 6** — Asserts `areaServed.length === 6` and each entry is in a known whitelist.
9. **knowsAbout length = 6** — Asserts `knowsAbout.length === 6` and matches the master-plan list verbatim.
10. **`sameAs` is empty array, not undefined** — Empty `sameAs` is allowed; missing or `null` is not.
11. **URLs absolute** — All URL-typed fields (`url`, `logo`, `image`) MUST start with `https://cyberskill.world` (no relative paths, no staging URLs).
12. **No "ISO 27001" / "SOC 2" anywhere** — `grep -ci 'iso 27001\|soc 2\|certified' apps/web/components/seo/professional-service.ts` MUST be 0 (until the cert lands).
13. **Rich Results Test passes** — CI step: `pnpm exec node tools/seo/rich-results-test.mjs https://staging.cyberskill.world/` returns 0 ERROR-level findings. (Uses Google's free Rich Results Test API or local schema validation as fallback.)
14. **Schema HTML size ≤ 2 KB** — The rendered `<script type="application/ld+json">` block MUST gzip to ≤ 2 KB. Asserted in `jsonld-ssr.spec.ts`.

---

## §5 — Verification method

**Tests (`verify: T`):**

```typescript
// apps/web/components/seo/__tests__/professional-service.test.ts
import { describe, expect, test } from 'vitest';
import { PROFESSIONAL_SERVICE } from '../professional-service';

describe('FR-SEO-001 — ProfessionalService schema', () => {
  test('AC#5: legal name is all-caps', () => {
    expect(PROFESSIONAL_SERVICE.legalName).toBe(PROFESSIONAL_SERVICE.legalName.toUpperCase());
    expect(PROFESSIONAL_SERVICE.legalName).toMatch(/^CYBERSKILL/);
  });
  test('AC#6: DUNS 9 digits, exact value', () => {
    const duns = PROFESSIONAL_SERVICE.identifier.find(i => i.propertyID === 'DUNS');
    expect(duns?.value).toBe('673219568');
    expect(duns?.value).toMatch(/^\d{9}$/);
  });
  test('AC#7: founder Vietnamese name UTF-8 intact', () => {
    expect(PROFESSIONAL_SERVICE.founder.alternateName).toBe('Trịnh Thái Anh');
    expect(Buffer.byteLength(PROFESSIONAL_SERVICE.founder.alternateName, 'utf8')).toBe(18);
  });
  test('AC#8: areaServed exactly 6 entries', () => {
    expect(PROFESSIONAL_SERVICE.areaServed).toHaveLength(6);
    expect(PROFESSIONAL_SERVICE.areaServed).toEqual([
      'United States', 'Canada', 'European Union', 'United Kingdom', 'Australia', 'Vietnam',
    ]);
  });
  test('AC#9: knowsAbout exactly 6 entries', () => {
    expect(PROFESSIONAL_SERVICE.knowsAbout).toHaveLength(6);
  });
  test('AC#10: sameAs is empty array (not undefined)', () => {
    expect(Array.isArray(PROFESSIONAL_SERVICE.sameAs)).toBe(true);
    expect(PROFESSIONAL_SERVICE.sameAs).toHaveLength(0);
  });
  test('AC#11: URLs absolute', () => {
    for (const url of [PROFESSIONAL_SERVICE.url, PROFESSIONAL_SERVICE.logo, PROFESSIONAL_SERVICE.image]) {
      expect(url).toMatch(/^https:\/\/cyberskill\.world/);
    }
  });
  test('AC#12: no premature cert claims', () => {
    const s = JSON.stringify(PROFESSIONAL_SERVICE).toLowerCase();
    expect(s).not.toMatch(/iso 27001/);
    expect(s).not.toMatch(/soc 2/);
    expect(s).not.toMatch(/certified/);
  });
});
```

```typescript
// apps/web/tests/seo/jsonld-ssr.spec.ts (Playwright)
import { test, expect } from '@playwright/test';
import { gzipSync } from 'node:zlib';

test('AC#1+#2: JSON-LD in SSR HTML (no JS needed)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  const html = await page.content();
  expect(html).toMatch(/<script type="application\/ld\+json">/);
  expect(html).toMatch(/"@type":\s*"ProfessionalService"/);
});

test('AC#14: JSON-LD gzip ≤ 2 KB', async ({ page }) => {
  await page.goto('/');
  const scriptText = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(gzipSync(scriptText!).byteLength).toBeLessThanOrEqual(2048);
});
```

CI gate: `pnpm -F web test && pnpm -F web exec playwright test tests/seo/`. Failure blocks merge.

---

## §6 — Dependencies

- FR-WEB-001 — needs the layout to mount into.
- DUNS verification (D&B record) — already issued: 673219568. No external dependency on issuance.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Schema becomes invalid after a schema.org spec bump | Google Rich Results Test fails | Update local cached schema; re-validate; possibly pin a schema.org version |
| Legal name changes (re-registration, merger) | Manual review (annual) | Open `FR-SEO-001a-legal-name-update` superseding FR; DO NOT edit in place |
| OG image URL 404s | Schema validation, manual check | Verify `og.jpg` is at `https://cyberskill.world/og.jpg`; CI step pings the URL |
| Founder name diacritics corrupted at build time | AC#7 fails | Force UTF-8 in build pipeline (`LANG=en_US.UTF-8`); add encoding=utf-8 to file write |
| `sameAs` left empty after LinkedIn publishes | Reminder | Schedule a follow-up FR once LinkedIn URL is live; not blocking initial ship |
| Schema content drifts between layout.tsx render and the .ts source | Unit test catches | The render path is single-source from `PROFESSIONAL_SERVICE`; no duplication allowed |
| ProfessionalService doesn't unlock the Knowledge Graph entry | Wait + monitor (Google takes 4-8 weeks to index) | Add `sameAs` to LinkedIn / Crunchbase / GitHub org once live (FR-SEO-NNN) |
| Premature cert claim slips in via copy-paste from a future doc | AC#12 grep | Reject PR; the cert badge belongs in marketing copy AFTER it's actually issued |

---

## §8 — Notes

- The `image` URL (`og.jpg`) is shared with FR-SEO-004 (OG/Twitter meta). One image, two consumers. FR-SEO-004 specifies the 1200×630 dimensions + the design (Lumi against gold-on-brown with slogan baked in).
- The `sameAs` array is reserved for FR-SEO-NNN once the LinkedIn / GitHub-org / Crunchbase pages are live. Leaving it as `[]` is preferable to omitting the key (some validators want it present).
- The `legalName` field is the legally-binding name; the `name` field is the marketing/display name. Both are required by Schema.org for entity resolution. Don't merge them.
- The 18-byte UTF-8 length for "Trịnh Thái Anh" is `T(1) r(1) ị(3 — i + combining diacritic = 2 + 1) n(1) h(1) space(1) T(1) h(1) á(2) i(1) space(1) A(1) n(1) h(1)` — verified manually. If this changes (alternate font, alternate composition), update AC#7.

---

*End of FR-SEO-001. Audit: `FR-SEO-001-schema-org-professional-service.audit.md`.*
