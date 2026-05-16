---
id: FR-CMS-004
title: "Sanity.io schema — CaseStudy / Testimonial / Capability / TeamMember / Job document types with type-safe codegen"
module: CMS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P4
slice: 1
owner: Frontend Lead + Content/Marketing
created: 2026-05-16
related_frs: [FR-CMS-005, FR-CMS-006, FR-CMS-007, FR-SCENE-005, FR-WEB-008, FR-A11Y-001]
depends_on: []
blocks: [FR-CMS-005, FR-CMS-006]
language: typescript 5.6 + sanity 3.x
service: apps/web/sanity/
new_files:
  - apps/web/sanity/schemas/case_study.ts
  - apps/web/sanity/schemas/testimonial.ts
  - apps/web/sanity/schemas/capability.ts
  - apps/web/sanity/schemas/team_member.ts
  - apps/web/sanity/schemas/job.ts
  - apps/web/sanity/schemas/index.ts
  - apps/web/sanity/sanity-codegen.config.ts
  - apps/web/lib/sanity/types.generated.ts (codegen output)
  - apps/web/sanity/__tests__/schema-validators.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §5.1 — "Sanity.io as CMS for case studies, testimonials, capabilities, team, jobs"
  - docs/01-master-plan-v2.md §5.2 — schema patterns
  - FR-SCENE-005 — privacy boundary: TeamMember has NO contact fields beyond name + role
  - Sanity schema documentation v3 (group, ordering, validation)

effort_hours: 8
risk_if_skipped: "CMS schema is the entire backbone of /work, /capabilities, /team pages. Without it: content lives in markdown files (rebuild on every change → slow), or in a different CMS (vendor lock + integration cost). Sanity is the master plan choice; schema gates everything downstream."
---

## §1 — Description (BCP-14 normative)

1. **MUST** define 5 Sanity document types with these schemas:

   **CaseStudy** (`case_study`):
   - `title` — required string, 10-120 chars
   - `slug` — required slug, derived from title (FR-CMS-006 routing key)
   - `client_name` — required string, 2-80 chars
   - `client_logo` — image (with hotspot + alt text)
   - `summary` — required portable text, 50-300 chars
   - `body` — required portable text (rich content)
   - `hero_image` — required image (16:9 minimum)
   - `gallery` — array of images (0-12)
   - `outcome_metrics` — array of { label: string, value: string, delta_direction: enum[up,down,neutral] }
   - `services_used` — references to Capability documents
   - `published_at` — datetime
   - `featured_order` — number (for homepage ordering; null = unpublished)
   - `i18n_locale` — enum[en, vi]
   - `seo` — object { meta_title, meta_description, og_image }

   **Testimonial** (`testimonial`):
   - `quote` — required portable text, 50-500 chars
   - `author_name` — required string
   - `author_role` — required string
   - `author_company` — required string
   - `author_avatar` — image
   - `case_study_ref` — reference to a CaseStudy (optional anchor)
   - `featured_order` — number
   - `i18n_locale` — enum[en, vi]

   **Capability** (`capability`):
   - `name` — required string (e.g., "Three.js / WebGL")
   - `slug`
   - `description` — required portable text
   - `icon` — image (SVG preferred)
   - `parent_category` — enum[design, engineering, ops, research]
   - `featured_order` — number
   - `i18n_locale` — enum[en, vi]

   **TeamMember** (`team_member`):
   - `name` — required string (display name, may be alias)
   - `role` — required string ("Founder", "Engineer", etc.)
   - `bio` — portable text (optional, public-facing)
   - `avatar` — image
   - `featured_order` — number
   - `i18n_locale` — enum[en, vi]
   - **MUST NOT** include: email, phone, real name (if different from display name), home location, dependents, salary, age, or any field that would constitute PII beyond public-facing professional identity.

   **Job** (`job`):
   - `title` — required string (e.g., "Senior R3F Engineer")
   - `slug`
   - `department` — enum[engineering, design, ops, growth]
   - `level` — enum[junior, mid, senior, principal]
   - `location_type` — enum[remote, hybrid, hcmc-on-site]
   - `summary` — required portable text
   - `description` — required portable text (requirements, expectations, benefits)
   - `ats_external_id` — string (links to Workable / Greenhouse job ID per FR-CTA-004)
   - `published_at` — datetime
   - `closed_at` — datetime (nullable)
   - `i18n_locale` — enum[en, vi]

2. **MUST** include `slug.current` for routing on `case_study` + `job` document types per FR-CMS-006 + FR-CTA-004 deep linking.

3. **MUST** validate required fields via Sanity schema validators (`Rule.required()`, `.min()`, `.max()`, custom validators where needed).

4. **MUST** include `i18n_locale` field on every document for FR-CMS-007 locale switching. Documents are duplicated per locale (Sanity Document Internationalization plugin pattern).

5. **MUST** run Sanity TypeGen (or sanity-codegen) to emit TypeScript types at `apps/web/lib/sanity/types.generated.ts`. These types are consumed by FR-CMS-006 `/work/[slug]` route + FR-CMS-007 locale loader.

6. **MUST** verify schema drift via CI gate — running `pnpm sanity typegen` in CI fails if generated types diverge from committed types.

7. **MUST NOT** include PII in TeamMember beyond public-facing role + name + bio + avatar per FR-SCENE-005 privacy boundary. Founder-approved field list only.

8. **MUST** use Sanity's `groups` feature to organize fields by category (Content / Metadata / SEO / Internationalization) for editor UX.

9. **MUST** use `ordering` for document lists (e.g., CaseStudy sorted by `featured_order ASC, published_at DESC`).

10. **MUST** include image hotspot + crop on all image fields (FR-CMS-006 responsive image rendering depends on this).

11. **MUST** include alt-text field on every image for FR-A11Y-001 a11y compliance:
    ```ts
    fields: [{ name: 'alt', type: 'string', validation: Rule => Rule.required() }]
    ```

12. **MUST** ship a draft preview workflow (Sanity draft documents visible to editors via FR-CMS-006 draft mode).

13. **MUST** lock document deletion — only specific Sanity roles can delete (case studies don't accidentally vanish from prod).

14. **MUST** support a "scheduled publish" workflow — `published_at` in future = document hidden from public queries.

## §2 — Why this design

**Why Sanity (not Contentful, Strapi, Hygraph)?** Sanity is:
- Schema-as-code (TypeScript) — version-controlled, code-reviewed, no GUI schema drift.
- Real-time editor experience (Studio).
- Portable text (vs Markdown / HTML) — structured, queryable, customizable.
- TypeGen support — codegen produces TS types from schemas.
- Generous free tier; scales as needed.

**Why 5 document types?** Master plan §5.1 codifies these as the core CMS surface:
- CaseStudy = the proof of work
- Testimonial = the social proof
- Capability = "what we do" (used in /capabilities page)
- TeamMember = "who we are" (with PII guardrails)
- Job = "join us" (links to ATS)

5 types is enough granularity; more would fragment editor mental model.

**Why TypeGen?** Without generated types, every frontend query is "any" or hand-written types that drift. With codegen, schema change → type change → compile errors flush out usage sites. Single source of truth.

**Why i18n_locale (vs Sanity Document Internationalization plugin)?** Two approaches:
1. Plugin-based: one document with `{en, vi}` field per locale value.
2. Document-per-locale: separate `case_study` documents per locale, linked by `_translations` ref.

Sanity now recommends approach (2) for better editor UX, separate workflows per locale. We go with (2) via simple `i18n_locale` enum.

**Why PII guardrails on TeamMember?** Privacy + safety. Founder's home address must never be queryable. Restricting schema fields makes "we'll just add this one column" mistakes impossible. Forces deliberate review.

**Why outcome_metrics structured (not free-form)?** Case studies often have "we delivered X% lift" — structuring these enables /work cards to render metrics consistently + filter by them.

**Why featured_order (vs separate "is featured" boolean)?** Single field handles both "featured" (non-null) + "ordering" (numeric value). Less schema surface, clearer editor model.

**Why slug only on CaseStudy + Job?** Those are public URL endpoints. Testimonials + Capabilities + TeamMembers render inside aggregated pages (not their own routes).

**Why scheduled publish?** Future-publish = "the campaign launches Monday." Without schedule support, founder publishes at midnight Sunday manually. Schedule = sleep.

## §3 — Public surface

```ts
// apps/web/sanity/schemas/case_study.ts
import { defineField, defineType } from "sanity";

export const caseStudy = defineType({
  name: "case_study",
  type: "document",
  title: "Case Study",
  groups: [
    { name: "content", title: "Content" },
    { name: "metadata", title: "Metadata" },
    { name: "seo", title: "SEO" },
    { name: "i18n", title: "Internationalization" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: Rule => Rule.required().min(10).max(120),
      group: "content",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: Rule => Rule.required(),
      group: "metadata",
    }),
    defineField({
      name: "client_name",
      type: "string",
      validation: Rule => Rule.required().min(2).max(80),
      group: "content",
    }),
    defineField({
      name: "client_logo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", validation: Rule => Rule.required() }],
      group: "content",
    }),
    defineField({
      name: "summary",
      type: "blockContent",
      validation: Rule => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "body",
      type: "blockContent",
      validation: Rule => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "hero_image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", validation: Rule => Rule.required() }],
      validation: Rule => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", validation: r => r.required() }] }],
      validation: Rule => Rule.max(12),
      group: "content",
    }),
    defineField({
      name: "outcome_metrics",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "label", type: "string", validation: Rule => Rule.required() },
          { name: "value", type: "string", validation: Rule => Rule.required() },
          { name: "delta_direction", type: "string", options: { list: ["up", "down", "neutral"] } },
        ],
      }],
      group: "metadata",
    }),
    defineField({
      name: "services_used",
      type: "array",
      of: [{ type: "reference", to: [{ type: "capability" }] }],
      group: "metadata",
    }),
    defineField({
      name: "published_at",
      type: "datetime",
      group: "metadata",
    }),
    defineField({
      name: "featured_order",
      type: "number",
      group: "metadata",
    }),
    defineField({
      name: "i18n_locale",
      type: "string",
      options: { list: [{ title: "English", value: "en" }, { title: "Vietnamese", value: "vi" }] },
      validation: Rule => Rule.required(),
      initialValue: "en",
      group: "i18n",
    }),
    defineField({
      name: "seo",
      type: "object",
      fields: [
        { name: "meta_title", type: "string", validation: Rule => Rule.max(60) },
        { name: "meta_description", type: "string", validation: Rule => Rule.max(160) },
        { name: "og_image", type: "image" },
      ],
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Featured (custom order)",
      name: "featured",
      by: [{ field: "featured_order", direction: "asc" }, { field: "published_at", direction: "desc" }],
    },
    {
      title: "Newest first",
      name: "published_desc",
      by: [{ field: "published_at", direction: "desc" }],
    },
  ],
});
```

```ts
// apps/web/sanity/schemas/team_member.ts (PII-restricted)
import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "team_member",
  type: "document",
  title: "Team Member",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Display name (public)",
      description: "Public display name. May be alias / partial real name. Per FR-SCENE-005 privacy boundary.",
      validation: Rule => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "role",
      type: "string",
      title: "Role title",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "bio",
      type: "blockContent",
      title: "Bio (public-facing)",
      description: "Professional bio. NO contact info, NO address, NO age, NO family.",
    }),
    defineField({
      name: "avatar",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", validation: Rule => Rule.required() }],
    }),
    defineField({
      name: "featured_order",
      type: "number",
    }),
    defineField({
      name: "i18n_locale",
      type: "string",
      options: { list: [{ value: "en", title: "English" }, { value: "vi", title: "Vietnamese" }] },
      initialValue: "en",
      validation: Rule => Rule.required(),
    }),
  ],
  // INTENTIONALLY NO email, phone, address, real_name, age, salary fields.
});
```

```ts
// apps/web/sanity/schemas/index.ts
import { caseStudy } from "./case_study";
import { testimonial } from "./testimonial";
import { capability } from "./capability";
import { teamMember } from "./team_member";
import { job } from "./job";

export const schemaTypes = [caseStudy, testimonial, capability, teamMember, job];
```

```ts
// apps/web/sanity/sanity-codegen.config.ts
import { defineConfig } from "@sanity/codegen";
export default defineConfig({
  schemaPath: "./apps/web/sanity/schemas",
  outputPath: "./apps/web/lib/sanity/types.generated.ts",
  options: { strict: true, namingStrategy: "camelCase" },
});
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 5 schema files present + valid Sanity types | `pnpm sanity schema:validate` |
| 2 | Validators (required, min/max) active | Sanity Studio shows error on empty required field |
| 3 | TeamMember has no PII fields (no email/phone/address) | grep schema; assert absence |
| 4 | TypeGen runs + emits types.generated.ts | `pnpm sanity typegen` succeeds |
| 5 | Generated types match committed types | CI diff check |
| 6 | slug.current present on CaseStudy + Job | Sanity inspect |
| 7 | i18n_locale field on all 5 types | Sanity inspect |
| 8 | Image fields have alt-text field + required validator | Sanity inspect |
| 9 | Groups organize fields (Content / Metadata / SEO / i18n) | Editor UX visual |
| 10 | Default orderings on document lists | Sanity Studio shows |
| 11 | Vitest unit tests on validator logic | `pnpm vitest run apps/web/sanity/__tests__/schema-validators.unit.test.ts` |
| 12 | Draft preview works | Manual: edit doc → save draft → frontend draft mode shows |
| 13 | Document deletion locked except for admin role | Sanity Studio role check |
| 14 | Scheduled publish honored (future published_at hides from public) | Test with future timestamp |

## §5 — Verification

```ts
// apps/web/sanity/__tests__/schema-validators.unit.test.ts
import { describe, it, expect } from "vitest";
import { schemaTypes } from "../schemas";

describe("Sanity schemas", () => {
  it("has 5 document types", () => {
    expect(schemaTypes.length).toBe(5);
  });

  it("CaseStudy has slug + title + required hero_image", () => {
    const cs = schemaTypes.find(s => s.name === "case_study")!;
    expect(cs.fields.find((f: any) => f.name === "slug")).toBeDefined();
    expect(cs.fields.find((f: any) => f.name === "title")).toBeDefined();
    expect(cs.fields.find((f: any) => f.name === "hero_image")).toBeDefined();
  });

  it("TeamMember has NO email/phone/address fields", () => {
    const tm = schemaTypes.find(s => s.name === "team_member")!;
    const fieldNames = tm.fields.map((f: any) => f.name);
    expect(fieldNames).not.toContain("email");
    expect(fieldNames).not.toContain("phone");
    expect(fieldNames).not.toContain("address");
    expect(fieldNames).not.toContain("real_name");
    expect(fieldNames).not.toContain("salary");
    expect(fieldNames).not.toContain("age");
  });

  it("All image fields require alt text", () => {
    function walkFields(fields: any[]) {
      for (const f of fields) {
        if (f.type === "image") {
          const alt = f.fields?.find((sub: any) => sub.name === "alt");
          expect(alt, `${f.name} missing alt`).toBeDefined();
        }
        if (f.type === "array" && f.of) {
          for (const sub of f.of) {
            if (sub.type === "image") {
              const alt = sub.fields?.find((s: any) => s.name === "alt");
              expect(alt).toBeDefined();
            }
          }
        }
      }
    }
    for (const type of schemaTypes) {
      walkFields(type.fields);
    }
  });

  it("All types have i18n_locale field", () => {
    for (const type of schemaTypes) {
      const locale = (type.fields as any[]).find(f => f.name === "i18n_locale");
      expect(locale, `${type.name} missing i18n_locale`).toBeDefined();
    }
  });
});
```

## §6 — Dependencies

**Concept:** FR-CMS-005 (ISR consumer of these schemas), FR-CMS-006 (/work/[slug] consumes), FR-CMS-007 (locale switcher reads i18n_locale), FR-SCENE-005 (TeamMember privacy boundary).

**Operational:** Sanity 3.x, `@sanity/codegen`, Sanity Studio for content editing, FR-WEB-008 (Sanity client config).

**Downstream:** FR-CMS-005, FR-CMS-006, FR-CMS-007, FR-SEO-002 (Article JSON-LD on CaseStudy).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Schema drift between Sanity Studio + frontend types | CI codegen diff | Run `pnpm sanity typegen`; commit updated types |
| Editor adds PII field via Studio GUI | Schema-as-code prevents | All schema changes via PR; CODEOWNERS gate |
| Image without alt text | AC#8 validator | Sanity rejects publish |
| Locale field missing on new doc | Schema validator | initialValue + required = always set |
| Slug collision (two case studies same title) | Slug source uniqueness | Sanity validates; appends -2, -3 |
| Capability deleted while referenced by CaseStudy | Reference broken | Use "weak reference" or pre-delete check |
| Scheduled publish missed (server clock issue) | Time drift | Vercel runs UTC; published_at in UTC |
| Draft accidentally published | Manual | Draft preview only on dev/staging |
| Image upload too large (>10 MB) | Sanity 413 error | Validate at upload; resize via Sanity Image Pipeline |
| Sanity API token leaked | Audit | Rotate token; review .env exposure |
| Codegen breaks on minor Sanity bump | Build fail | Pin Sanity version; CI tests bump in branch |
| Editor types unsafe content (XSS) | Portable text sanitization | Render via @portabletext/react with sanitization |
| i18n_locale missing on legacy docs | DataMigration | One-time migration script sets locale="en" default |
| Featured_order conflict (two CSs with same number) | Stable sort applied | Document publishes order resolves ties |
| ATS_external_id orphaned (job closed in ATS) | Job listed but ATS 404 | Cross-check FR-CTA-004 |

## §8 — Deliverable preview

Editor experience in Sanity Studio:

```
Case Studies (5 documents)
├── ACME Studio — Museum Exhibit (en)        [featured: 1]
├── ACME Studio — Triển lãm Bảo tàng (vi)    [featured: 1]
├── Beta Health — Patient Dashboard (en)     [featured: 2]
├── Gamma Co — Onboarding Flow (en)          [featured: 3]
└── Delta Studio — Brand Refresh (en)        [draft, no order]

Editor opens "ACME Studio — Museum Exhibit":
Groups: [ Content ] [ Metadata ] [ SEO ] [ Internationalization ]

Content:
  Title: "Museum Exhibit — ACME Studio"
  Client name: "ACME Studio"
  Client logo: [drag image; alt-text required field]
  Summary: [portable text editor]
  Body: [portable text editor]
  Hero image: [drag image; alt-text required field]
  Gallery: [0-12 images]

Metadata:
  Slug: "museum-exhibit-acme" (auto from title)
  Outcome metrics: + Add metric
  Services used: [Reference picker → Capability documents]
  Published at: 2026-05-19 09:00 ICT
  Featured order: 1

SEO:
  Meta title: "Museum Exhibit — ACME Studio | CyberSkill"
  Meta description: "How we built..."
  OG image: [drag image]

Internationalization:
  Locale: English
```

Editor adds new TeamMember — note absent fields:
```
Display name: "Stephen Cheng"   ← public name (may be alias)
Role: "Founder"
Bio: [portable text]
Avatar: [drag image]
Featured order: 1
Locale: English

(NO email field — by schema design.
 NO phone field — by schema design.
 NO address field — by schema design.)
```

## §9 — Notes

**On Sanity vs alternatives:** Strapi is open-source but ops-heavy; Contentful is mature but expensive at scale; Hygraph is similar to Sanity but smaller community. Sanity's portable text + schema-as-code wins for our needs.

**On PII restriction durability:** Schema-as-code = PII fields can't be added via Studio. Only via PR with CODEOWNERS approval. Founder + Frontend Lead must approve any TeamMember schema change.

**On translation workflow (FR-CMS-vi):** Vietnamese version of CaseStudy is a separate Sanity document with `i18n_locale: 'vi'`. FR-CMS-007 locale-aware loader queries the right one.

**On schema versioning:** Sanity has no built-in versioning. We version-control the schema source files; production rolls forward via Sanity Studio deployments.

**On future workflow integrations:** Sanity webhooks (FR-CMS-005) trigger Vercel revalidation. Slack notification on publish events (slice 2). Approval workflow (slice 3 — multi-editor staging).

**On portable text richness:** We use `blockContent` (custom array of blocks + images + custom embeds). Future: embed code samples, video, interactive demos. Slice 2 candidate.

**On accessibility of CMS-rendered content:** Frontend renders portable text via `@portabletext/react`; FR-A11Y-001 contrast + focus tokens apply uniformly. Image alt-text is enforced at schema level.

*End of FR-CMS-004.*
