---
id: FR-SEO-002
title: "Service schema sub-blocks — JSON-LD per capability with @id provider linkage to ProfessionalService"
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
related_frs: [FR-SEO-001, FR-SEO-004, FR-CMS-004, FR-CMS-006]
depends_on: [FR-SEO-001]
blocks: []
language: typescript 5.6 + react 19 + next 15
service: apps/web/components/seo/ + apps/web/lib/seo/
new_files:
  - apps/web/components/seo/ServiceJsonLd.tsx
  - apps/web/lib/seo/capabilities-schema.ts
  - apps/web/components/seo/__tests__/ServiceJsonLd.unit.test.ts

source_pages:
  - docs/01-master-plan-v2.md §8.2 — "Service JSON-LD per capability"
  - schema.org/Service documentation
  - Google Rich Results Test guidelines

effort_hours: 3
risk_if_skipped: "Google + AI search assistants can't tell which capabilities CyberSkill offers without structured Service schema. Capability-keyword search (e.g., 'Three.js studio Vietnam') doesn't surface our /capabilities page in rich results. ~15% organic CTR lost on capability queries."
---

## §1 — Description (BCP-14 normative)

1. **MUST** ship 6 Service JSON-LD blocks — one per core capability:
   - React (web app development)
   - Three.js / R3F (3D web)
   - TypeScript (typed development)
   - Node.js (backend)
   - AI / RAG (AI integration)
   - Design Systems (UI architecture)
2. **MUST** each Service references the parent ProfessionalService (FR-SEO-001) via `provider` field with `@id` linkage:
   ```json
   "provider": { "@type": "Organization", "@id": "https://cyberskill.world/#organization" }
   ```
3. **MUST** include `serviceType` + `areaServed` per Service.
4. **MUST** include `description`, `name`, `url` (links to /capabilities#<id>).
5. **MUST** be embedded on `/capabilities` page (one composite ItemList containing all 6) + on `/` homepage.
6. **MUST** be axe-clean (script tags don't break a11y).
7. **MUST** pass Google Rich Results Test for each Service block.
8. **MUST** be validated via Vitest unit test (JSON schema check) + Playwright E2E (DOM presence).

## §2 — Why this design

**Why Service (not Offer or other types)?** Service is the schema.org-recommended type for "service offering" — capability listings fit. Offer is for purchasable products.

**Why @id linkage to ProfessionalService?** schema.org allows cross-document linking via @id. Search engines + LLM crawlers understand "Service X is provided by Organization Y" without duplicating Organization properties.

**Why both /capabilities + /?** /capabilities is the canonical destination. Homepage embed signals to crawlers that this org offers these services.

**Why ItemList on /capabilities?** Lists all 6 in one composite — semantically "this page is a list of services."

**Why serviceType + areaServed?** Tightens specificity. serviceType="Web Development" + areaServed="Worldwide" = clearer intent than just description text.

## §3 — Public surface

```ts
// apps/web/lib/seo/capabilities-schema.ts
export interface CapabilitySchema {
  id: string;       // anchor id on /capabilities
  name: string;
  serviceType: string;
  description: string;
}

export const CAPABILITIES: CapabilitySchema[] = [
  {
    id: "react", name: "React Development",
    serviceType: "Web Application Development",
    description: "React 19, Next.js 15, server components, App Router; full-stack React applications.",
  },
  {
    id: "threejs", name: "Three.js / R3F",
    serviceType: "3D Web Development",
    description: "Three.js, React Three Fiber, WebGL2, GLSL shaders; cinematic 3D web experiences.",
  },
  {
    id: "typescript", name: "TypeScript",
    serviceType: "Typed Development",
    description: "Strict TypeScript, type-driven design, zero-runtime types via Zod / Effect / etc.",
  },
  {
    id: "nodejs", name: "Node.js Backend",
    serviceType: "Backend Development",
    description: "Node.js, edge runtime, serverless functions, BFF patterns.",
  },
  {
    id: "ai-rag", name: "AI / RAG Integration",
    serviceType: "AI Integration",
    description: "LLM integration, RAG pipelines, vector search, agent workflows.",
  },
  {
    id: "design-systems", name: "Design Systems",
    serviceType: "UI Architecture",
    description: "Token-driven design systems, component libraries, accessibility, multi-theme.",
  },
];

export function buildServiceJsonLd(cap: CapabilitySchema, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/capabilities#${cap.id}`,
    "name": cap.name,
    "serviceType": cap.serviceType,
    "description": cap.description,
    "url": `${siteUrl}/capabilities#${cap.id}`,
    "areaServed": "Worldwide",
    "provider": {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    },
  };
}

export function buildItemListJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CyberSkill capabilities",
    "url": `${siteUrl}/capabilities`,
    "itemListElement": CAPABILITIES.map((cap, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": buildServiceJsonLd(cap, siteUrl),
    })),
  };
}
```

```tsx
// apps/web/components/seo/ServiceJsonLd.tsx
import { CAPABILITIES, buildItemListJsonLd, buildServiceJsonLd } from "@/lib/seo/capabilities-schema";

const SITE_URL = "https://cyberskill.world";

export function CapabilitiesJsonLd({ embedMode = "list" }: { embedMode?: "list" | "individual" }) {
  if (embedMode === "list") {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildItemListJsonLd(SITE_URL)) }}
      />
    );
  }
  return (
    <>
      {CAPABILITIES.map(cap => (
        <script
          key={cap.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildServiceJsonLd(cap, SITE_URL)) }}
        />
      ))}
    </>
  );
}
```

```tsx
// Usage on /capabilities page
import { CapabilitiesJsonLd } from "@/components/seo/ServiceJsonLd";

export default function CapabilitiesPage() {
  return (
    <>
      <CapabilitiesJsonLd embedMode="list" />
      <h1>What we do</h1>
      ...
    </>
  );
}

// Usage on homepage — embed all 6 individually for richer signal
export default function Home() {
  return (
    <>
      <CapabilitiesJsonLd embedMode="individual" />
      ...
    </>
  );
}
```

## §4 — Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| 1 | 6 Service blocks present in /capabilities head | DOM inspection |
| 2 | All link to ProfessionalService via @id | JSON-LD parse + verify |
| 3 | Rich Results Test passes for each Service | Manual via Google tool |
| 4 | serviceType + areaServed populated | JSON-LD parse |
| 5 | @id format matches `https://...#anchor` | Regex check |
| 6 | ItemList wrapper on /capabilities | JSON-LD parse |
| 7 | Individual blocks on / homepage | JSON-LD parse |
| 8 | Vitest unit tests on buildServiceJsonLd | pnpm vitest |
| 9 | No duplicate @id values | Validation |
| 10 | axe-clean (script tags don't impact) | AxeBuilder |

## §5 — Verification

```tsx
import { describe, it, expect } from "vitest";
import { buildServiceJsonLd, buildItemListJsonLd, CAPABILITIES } from "../capabilities-schema";

describe("Service JSON-LD", () => {
  it("builds valid Service block for React", () => {
    const block = buildServiceJsonLd(CAPABILITIES[0], "https://cyberskill.world");
    expect(block["@type"]).toBe("Service");
    expect(block["@id"]).toBe("https://cyberskill.world/capabilities#react");
    expect(block.provider["@id"]).toBe("https://cyberskill.world/#organization");
  });

  it("ItemList wraps all 6 Service blocks", () => {
    const list = buildItemListJsonLd("https://cyberskill.world");
    expect(list["@type"]).toBe("ItemList");
    expect(list.itemListElement).toHaveLength(6);
  });

  it("no duplicate @id across capabilities", () => {
    const ids = CAPABILITIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each capability has serviceType + description", () => {
    for (const cap of CAPABILITIES) {
      expect(cap.serviceType).toBeTruthy();
      expect(cap.description).toBeTruthy();
    }
  });
});
```

## §6 — Dependencies

**Concept:** FR-SEO-001 (parent ProfessionalService @id target), FR-CMS-004 (capability schema source), FR-CMS-006 (/work case studies can reference Services).

**Operational:** schema.org/Service spec, Google Rich Results Test.

**Downstream:** Search rich snippets, AI search inclusion (ChatGPT, Perplexity, Claude search).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Schema validator complains about nesting | AC#3 | Use @id linkage; not full Organization embed |
| Duplicate @id (Service + Page) | AC#9 | Different @id namespaces |
| Service.serviceType not recognized term | RRT warn | Use schema.org-approved types |
| areaServed format wrong | RRT warn | "Worldwide" or Country object |
| RRT fails on missing required field | AC#3 | Verify required Service fields |
| ItemList vs individual confusion | Best practice | ItemList on /capabilities; individual on / |
| Capability data drifts (CMS vs hardcoded) | Source-of-truth Q | CAPABILITIES const here; CMS for content; align manually OR codegen from CMS |
| Vietnamese version not localized | Locale | description in EN even on /vi (services internationally identified) |
| Script tag injection (XSS) | Static data only | No user input; safe |
| AI search ignores schema | Industry behavior | Schema is signal; LLM crawlers increasingly read |
| Stale schema after capability rename | Manual maintenance | PR review on capability changes |
| Search Console manual penalty | Misuse | Stick to spec strictly |

## §8 — Deliverable preview

In /capabilities head:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "CyberSkill capabilities",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "item": { "@type": "Service", "@id": "...#react", "name": "React Development", ... } },
    ...
  ]
}
</script>
```

Google Rich Results Test:
- ✅ Valid Service markup x 6.
- ✅ Linked to Organization via @id.

## §9 — Notes

**On 'why hardcoded CAPABILITIES const (not Sanity)?** Capability list rarely changes (~yearly). Hardcoding gives type safety + simplicity. Could move to Sanity if list grows dynamic.

**On Vietnamese:** Vietnamese visitors see English serviceType (international term). Description could localize via next-intl; out of slice 1 scope.

**On future schemas:** Could add `Offer` for specific packages, `Review` aggregations. Slice 3.

*End of FR-SEO-002.*
