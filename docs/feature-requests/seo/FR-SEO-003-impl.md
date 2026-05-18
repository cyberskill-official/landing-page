---
id: FR-SEO-003
title: "Person JSON-LD for founder — Stephen Cheng / Trịnh Thái Anh with affiliation + UTF-8 diacritic guard"
module: SEO
priority: SHOULD
status: shipped
shipped: 2026-05-17
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P5
slice: 1
owner: SEO + Frontend Lead
created: 2026-05-16
related_frs: [FR-SEO-001, FR-SEO-002, FR-CMS-004]
depends_on: [FR-SEO-001]
blocks: []
language: typescript 5.6 + react 19
service: apps/web/components/seo/
new_files:
  - apps/web/components/seo/PersonJsonLd.tsx
  - apps/web/components/seo/__tests__/PersonJsonLd.unit.test.ts
  - apps/web/lib/seo/founder-schema.ts

source_pages:
  - docs/01-master-plan-v2.md §8.2 — "Person schema for founder bio anchor"
  - schema.org/Person spec
  - FR-SEO-001 UTF-8 guard for diacritics

effort_hours: 2
risk_if_skipped: "Founder bio is a brand signal. Without Person schema, Google can't surface 'Stephen Cheng founder CyberSkill' rich card. AI search assistants miss founder identity → 'who runs CyberSkill?' queries return generic results."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship Person JSON-LD for the founder with:
   - `name`: "Stephen Cheng" (English display name).
   - `alternateName`: "Trịnh Thái Anh" (Vietnamese legal name, verbatim with diacritics).
   - `jobTitle`: "Founder & CEO"
   - `affiliation`: linking to CyberSkill ProfessionalService via @id.
   - `url`: link to founder bio anchor on `/`.
   - `image`: optional avatar URL.
   - `sameAs`: array of social profile URLs (LinkedIn, GitHub, X, etc.).
2. **MUST** preserve diacritics in alternateName ("Trịnh Thái Anh") — UTF-8 throughout JSON-LD per FR-SEO-001 guard.
3. **MUST** be embedded near the founder bio anchor section on `/` (Scene 5 or footer).
4. **MUST** be axe-clean.
5. **MUST** pass Google Rich Results Test for Person markup.
6. **MUST** be tested via Vitest (JSON validation) + Playwright (DOM presence + UTF-8 integrity).

## §2 — Why this design

**Why Person schema?** Founder identity is a trust signal. Search engines + AI assistants use Person markup to enrich "who is the founder of X" queries.

**Why alternateName?** Vietnamese legal name "Trịnh Thái Anh" is the authentic identity. Public-facing English "Stephen Cheng" is the bridge name. Both matter for cultural authenticity (FR-SCENE-017 Vietnamese-to-global anchor).

**Why affiliation linkage to Organization?** Same @id pattern as FR-SEO-002 Service blocks. "Person X is affiliated with Org Y" is semantically rich.

**Why sameAs?** Connects Person across web. LinkedIn / GitHub URLs help search engines verify identity.

**Why near bio anchor?** Schema can be anywhere in body, but proximity to visible bio helps both humans (visible info) + crawlers (semantic clustering).

## §3 — Public surface

```ts
// apps/web/lib/seo/founder-schema.ts
export interface FounderSchema {
  name: string;
  alternateName: string;
  jobTitle: string;
  url: string;
  imageUrl?: string;
  sameAs: string[];
}

export const FOUNDER: FounderSchema = {
  name: "Stephen Cheng",
  alternateName: "Trịnh Thái Anh",  // UTF-8 with diacritics; verbatim
  jobTitle: "Founder & CEO",
  url: "https://cyberskill.world/#founder",
  imageUrl: "https://cyberskill.world/founder-avatar.jpg",  // 400x400 ideal
  sameAs: [
    "https://www.linkedin.com/in/stephen-cheng-cyberskill/",
    "https://github.com/zintaen",
    // etc.
  ],
};

export function buildPersonJsonLd(founder: FounderSchema, orgId: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": founder.url,
    "name": founder.name,
    "alternateName": founder.alternateName,
    "jobTitle": founder.jobTitle,
    "url": founder.url,
    "image": founder.imageUrl,
    "affiliation": {
      "@type": "Organization",
      "@id": orgId,
      "name": "CyberSkill",
    },
    "sameAs": founder.sameAs,
  };
}
```

```tsx
// apps/web/components/seo/PersonJsonLd.tsx
import { FOUNDER, buildPersonJsonLd } from "@/lib/seo/founder-schema";

const ORG_ID = "https://cyberskill.world/#organization";

export function FounderPersonJsonLd() {
  const json = JSON.stringify(buildPersonJsonLd(FOUNDER, ORG_ID));
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

```tsx
// Usage in / page near founder bio
import { FounderPersonJsonLd } from "@/components/seo/PersonJsonLd";

export default function Home() {
  return (
    <>
      ...
      <section id="founder">
        <h2>Meet the founder</h2>
        <FounderPersonJsonLd />
        <p>Hi, I'm Stephen Cheng — Trịnh Thái Anh. ...</p>
      </section>
      ...
    </>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | Person JSON-LD block present in /head or near #founder | DOM inspection |
| 2 | Diacritics intact: "Trịnh Thái Anh" in raw HTML | curl + grep |
| 3 | affiliation links to Organization @id | JSON parse |
| 4 | Rich Results Test passes | Manual |
| 5 | sameAs URLs absolute + valid | URL regex check |
| 6 | image URL accessible (200) | curl image URL |
| 7 | Vitest unit tests pass | pnpm vitest |
| 8 | axe-clean | AxeBuilder |
| 9 | UTF-8 charset header set (FR-SEO-001 guard) | curl -I header |
| 10 | Bio anchor #founder reachable | DOM has id="founder" |

## §5 — Verification

```ts
import { describe, it, expect } from "vitest";
import { buildPersonJsonLd, FOUNDER } from "../founder-schema";

describe("FounderPersonJsonLd", () => {
  const orgId = "https://cyberskill.world/#organization";

  it("builds valid Person block", () => {
    const block = buildPersonJsonLd(FOUNDER, orgId);
    expect(block["@type"]).toBe("Person");
    expect(block.name).toBe("Stephen Cheng");
  });

  it("preserves Vietnamese diacritics in alternateName", () => {
    const block = buildPersonJsonLd(FOUNDER, orgId);
    expect(block.alternateName).toBe("Trịnh Thái Anh");
    // Verify byte-level preserved (UTF-8 encoded)
    const serialized = JSON.stringify(block);
    expect(serialized).toContain("Trịnh");
    expect(serialized.charCodeAt(serialized.indexOf("ị"))).toBe(7883);  // U+1ECB
  });

  it("affiliation references Organization via @id", () => {
    const block = buildPersonJsonLd(FOUNDER, orgId);
    expect(block.affiliation["@id"]).toBe(orgId);
  });

  it("sameAs URLs are absolute https", () => {
    const block = buildPersonJsonLd(FOUNDER, orgId);
    for (const url of block.sameAs) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("script content survives JSON.stringify round-trip", () => {
    const block = buildPersonJsonLd(FOUNDER, orgId);
    const serialized = JSON.stringify(block);
    const parsed = JSON.parse(serialized);
    expect(parsed.alternateName).toBe(FOUNDER.alternateName);
  });
});
```

## §6 — Dependencies

**Concept:** FR-SEO-001 (Organization @id target), FR-SEO-002 (similar pattern), FR-CMS-004 (founder TeamMember CMS record).

**Operational:** Static JSON-LD via dangerouslySetInnerHTML.

**Downstream:** Google Knowledge Graph (long-term entity recognition), AI search assistants.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Diacritic corruption (Trinh Thai Anh without marks) | AC#2 | UTF-8 charset; never URL-encode in JSON-LD |
| @id affiliation broken (org id mismatch) | AC#3 | Constants; CI alignment test |
| sameAs URL 404s | AC#5 | Verify periodically; only stable profile URLs |
| Image 404 | AC#6 | Founder avatar in /public; static |
| Rich Results Test fails | AC#4 | Use schema.org-spec types; avoid Person-Author confusion |
| dangerouslySetInnerHTML XSS | Static data | No user input; safe |
| LinkedIn / GitHub profile rename | sameAs stale | Quarterly verification |
| Vietnamese name displayed in English contexts (cultural inappropriate) | UX | Founder's call: include in alternateName always |
| Schema typed Person vs ProfessionalService confusion | Spec read | Founder = Person; Company = Organization |
| Multiple Person blocks (founder + team) duplication | Pattern | One Person block per individual; clear @id |
| AI search ignores Person | Best-effort | Schema is hint; AI improves over time |
| Stale jobTitle (founder → CEO transition) | Manual | Const update on title change |

## §8 — Deliverable preview

In / head or near #founder section:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://cyberskill.world/#founder",
  "name": "Stephen Cheng",
  "alternateName": "Trịnh Thái Anh",
  "jobTitle": "Founder & CEO",
  "url": "https://cyberskill.world/#founder",
  "image": "https://cyberskill.world/founder-avatar.jpg",
  "affiliation": { "@type": "Organization", "@id": "https://cyberskill.world/#organization", "name": "CyberSkill" },
  "sameAs": ["https://www.linkedin.com/in/stephen-cheng-cyberskill/", "https://github.com/zintaen"]
}
</script>
```

Google query "who is the founder of CyberSkill":
- Rich card: "Stephen Cheng — Founder & CEO of CyberSkill" with avatar.
- Vietnamese variant query: name resolves via alternateName.

## §9 — Notes

**On 'why include real Vietnamese name?'** Founder is Vietnamese. Suppressing the real name = erasure of identity. Including signals authenticity + Vietnamese roots.

**On future team Person blocks:** FR-CMS-004 TeamMember schema supports. Each public team member could get Person block. Slice 3 — currently only founder is publicly named.

**On AI search:** ChatGPT / Perplexity increasingly use Person markup. Investment in schema = investment in next-gen search visibility.

*End of FR-SEO-003.*
