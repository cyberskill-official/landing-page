import { NextResponse } from "next/server";
import { company, services, processSteps, faqs, caseStudyDetails, siteUrl } from "@/lib/content/site";

export const runtime = "nodejs";

export async function GET() {
  const baseContent = `# ${company.shortName} (Full Specification)
> ${company.entity.en}

## About
- **Legal Name**: ${company.legalName}
- **Founding Year**: ${company.founded}
- **Headquarters**: ${company.city}, ${company.country}
- **Address**: ${company.address}
- **DUNS Number**: ${company.duns}
- **Contact Email**: ${company.email}
- **Contact Phone**: ${company.phone} (Contact: ${company.phoneContact})

## Services
${services
  .map(
    (s) =>
      `- **${s.title.en}**: ${s.summary.en}\n` +
      s.outcomes.map((o) => `  - Outcome: ${o.en}`).join("\n")
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
      `- **${c.isNda ? "NDA Project: " : ""}${c.clientName || "Anonymized Client"}** (${c.slug})\n` +
      `  - Challenge: ${c.challenge.en}\n` +
      `  - Approach: ${c.approach.en}\n` +
      `  - Outcome: ${c.outcome.en}\n` +
      `  - Stack: ${c.techStack.join(", ")}`
  )
  .join("\n\n")}

## Frequently Asked Questions (FAQ Digest)
${faqs.map((f) => `Q: ${f.q.en}\nA: ${f.a.en}`).join("\n\n")}

## Key URLs
- **Homepage**: ${siteUrl}
- **Careers & Talent Pool**: ${siteUrl}/en/careers
- **Portfolio & Case Studies**: ${siteUrl}/en/work
- **Engineering Insights**: ${siteUrl}/en/notes
- **Contact Form**: ${siteUrl}/en#contact
`;

  return new Response(baseContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
