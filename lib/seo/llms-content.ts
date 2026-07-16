/**
 * Markdown bodies for /llms.txt and /llms-full.txt (llmstxt.org).
 * Lighthouse agentic-browsing llms-txt audit requires an H1 and Markdown links.
 */
import {
  company,
  services,
  processSteps,
  faqs,
  caseStudyDetails,
  siteUrl,
} from "@/lib/content/site";

function mdLink(label: string, href: string): string {
  return `[${label}](${href})`;
}

/** Compact llms.txt — overview + services + key URLs as Markdown links. */
export function buildLlmsTxt(): string {
  return `# ${company.shortName}
> ${company.entity.en}

## About
- **Legal Name**: ${company.legalName}
- **Founding Year**: ${company.founded}
- **Headquarters**: ${company.city}, ${company.country}
- **Address**: ${company.address}
- **DUNS Number**: ${company.duns}
- **Contact Email**: ${mdLink(company.email, `mailto:${company.email}`)}
- **Contact Phone**: ${company.phone} (Contact: ${company.phoneContact})

## Services
${services
  .map(
    (s) =>
      `- **${s.title.en}**: ${s.summary.en}\n` +
      s.outcomes.map((o) => `  - Outcome: ${o.en}`).join("\n"),
  )
  .join("\n\n")}

## Key URLs
- **Homepage**: ${mdLink(siteUrl, siteUrl)}
- **Careers & Talent Pool**: ${mdLink(`${siteUrl}/en/careers`, `${siteUrl}/en/careers`)}
- **Portfolio & Case Studies**: ${mdLink(`${siteUrl}/en/work`, `${siteUrl}/en/work`)}
- **Engineering Insights**: ${mdLink(`${siteUrl}/en/notes`, `${siteUrl}/en/notes`)}
- **Contact Form**: ${mdLink(`${siteUrl}/en#contact`, `${siteUrl}/en#contact`)}
- **Full specification**: ${mdLink(`${siteUrl}/llms-full.txt`, `${siteUrl}/llms-full.txt`)}
`;
}

/** Expanded llms-full.txt — process, case studies, FAQ + same link contract. */
export function buildLlmsFullTxt(): string {
  return `# ${company.shortName} (Full Specification)
> ${company.entity.en}

## About
- **Legal Name**: ${company.legalName}
- **Founding Year**: ${company.founded}
- **Headquarters**: ${company.city}, ${company.country}
- **Address**: ${company.address}
- **DUNS Number**: ${company.duns}
- **Contact Email**: ${mdLink(company.email, `mailto:${company.email}`)}
- **Contact Phone**: ${company.phone} (Contact: ${company.phoneContact})

## Services
${services
  .map(
    (s) =>
      `- **${s.title.en}**: ${s.summary.en}\n` +
      s.outcomes.map((o) => `  - Outcome: ${o.en}`).join("\n"),
  )
  .join("\n\n")}

## Delivery Process
${processSteps
  .map((p) => `- **Step ${p.n} — ${p.title.en}**: ${p.body.en}`)
  .join("\n")}

## Case Studies & Portfolio
${caseStudyDetails
  .map(
    (c) =>
      `- **${c.isNda ? "NDA Project: " : ""}${c.clientName || "Anonymized Client"}** (${mdLink(c.slug, `${siteUrl}/en/work/${c.slug}`)})\n` +
      `  - Challenge: ${c.challenge.en}\n` +
      `  - Approach: ${c.approach.en}\n` +
      `  - Outcome: ${c.outcome.en}\n` +
      `  - Stack: ${c.techStack.join(", ")}`,
  )
  .join("\n\n")}

## Frequently Asked Questions (FAQ Digest)
${faqs.map((f) => `Q: ${f.q.en}\nA: ${f.a.en}`).join("\n\n")}

## Key URLs
- **Homepage**: ${mdLink(siteUrl, siteUrl)}
- **Careers & Talent Pool**: ${mdLink(`${siteUrl}/en/careers`, `${siteUrl}/en/careers`)}
- **Portfolio & Case Studies**: ${mdLink(`${siteUrl}/en/work`, `${siteUrl}/en/work`)}
- **Engineering Insights**: ${mdLink(`${siteUrl}/en/notes`, `${siteUrl}/en/notes`)}
- **Contact Form**: ${mdLink(`${siteUrl}/en#contact`, `${siteUrl}/en#contact`)}
- **Compact summary**: ${mdLink(`${siteUrl}/llms.txt`, `${siteUrl}/llms.txt`)}
`;
}

export const LLMS_CONTENT_TYPE = "text/plain; charset=utf-8";
export const LLMS_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600";
