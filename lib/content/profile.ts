import type { Locale } from "@/lib/i18n/config";
import { company, services } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";
import { localize } from "@/lib/i18n/types";

/**
 * FR-CTA-016: company profile one-pager facts from the publishable content SSOT.
 * Every line must be traceable to lib/content (policy / site) — no invented claims.
 */

export type ProfileFact = {
  /** Stable key for tests */
  key: string;
  /** Source path in content modules */
  source: string;
  text: string;
};

export function getProfileFacts(locale: Locale): ProfileFact[] {
  const facts: ProfileFact[] = [
    {
      key: "legalName",
      source: "lib/content/site.ts#company.legalName",
      text: company.legalName,
    },
    {
      key: "entity",
      source: "lib/content/site.ts#company.entity",
      text: company.entity[locale],
    },
    {
      key: "slogan",
      source: "lib/content/site.ts#company.slogan",
      text: company.slogan[locale],
    },
    {
      key: "founded",
      source: "lib/content/site.ts#company.founded",
      text: String(company.founded),
    },
    {
      key: "address",
      source: "lib/content/site.ts#company.address",
      text: company.address,
    },
    {
      key: "email",
      source: "lib/content/site.ts#company.email",
      text: company.email,
    },
    {
      key: "phone",
      source: "lib/content/site.ts#company.phone",
      text: company.phone,
    },
    {
      key: "duns",
      source: "lib/content/site.ts#company.duns",
      text: `DUNS ${company.duns}`,
    },
    {
      key: "registration",
      source: "lib/content/policy.ts#commercialPolicy.registrationNumber",
      text: commercialPolicy.registrationNumber,
    },
    {
      key: "url",
      source: "lib/content/site.ts#company.url",
      text: company.url,
    },
    {
      key: "ctaPromise",
      source: "lib/content/policy.ts#commercialPolicy.ctaPromise",
      text: commercialPolicy.ctaPromise[locale],
    },
    {
      key: "heroAudience",
      source: "lib/content/policy.ts#commercialPolicy.heroAudience",
      text: commercialPolicy.heroAudience[locale],
    },
    {
      key: "capacity",
      source: "lib/content/policy.ts#commercialPolicy.capacity",
      text:
        locale === "vi"
          ? `Tối đa ${commercialPolicy.capacity.projectsPerQuarter} dự án/quý; suất mở: ${localize(commercialPolicy.capacity.nextOpenSlot, locale)}`
          : `At most ${commercialPolicy.capacity.projectsPerQuarter} projects/quarter; next open: ${localize(commercialPolicy.capacity.nextOpenSlot, locale)}`,
    },
  ];

  for (const s of services) {
    facts.push({
      key: `service:${s.id}`,
      source: `lib/content/site.ts#services[${s.id}]`,
      text: `${localize(s.title, locale)} — ${localize(s.summary, locale)}`,
    });
  }

  for (const m of commercialPolicy.engagementModels) {
    facts.push({
      key: `engagement:${m.name.en}`,
      source: "lib/content/policy.ts#commercialPolicy.engagementModels",
      text: `${localize(m.name, locale)}: ${localize(m.range, locale)}; ${localize(m.timeline, locale)}`,
    });
  }

  return facts;
}

/** Profile document title for a locale. */
export function getProfileTitle(locale: Locale): string {
  return locale === "vi"
    ? `Hồ sơ công ty — ${company.shortName}`
    : `Company profile — ${company.shortName}`;
}

/**
 * Build a minimal valid PDF-1.4 containing UTF-16BE text lines.
 * Facts are embedded as Unicode so parity tests can read the file bytes.
 */
export function buildProfilePdf(locale: Locale): Uint8Array {
  const title = getProfileTitle(locale);
  const facts = getProfileFacts(locale);
  const lines = [title, "", ...facts.map((f) => f.text), "", company.url];

  // PDF text objects as UTF-16BE hex strings (with BOM) so non-ASCII is retained.
  const contentOps: string[] = ["BT", "/F1 11 Tf", "50 780 Td", "14 TL"];
  lines.forEach((line, i) => {
    const hex = utf16BeHex(line.slice(0, 200));
    if (i === 0) {
      contentOps.push(`/${"F1"} 14 Tf`);
      contentOps.push(`(${escapePdfAscii(title.slice(0, 80))}) Tj`);
      contentOps.push("/F1 10 Tf");
      contentOps.push("0 -18 Td");
    } else {
      // Prefer hex string for full Unicode retention in the file
      contentOps.push(`<${hex}> Tj`);
      contentOps.push("0 -13 Td");
    }
  });
  contentOps.push("ET");
  const stream = contentOps.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
  );
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new Uint8Array(Buffer.from(pdf, "utf8"));
}

function utf16BeHex(s: string): string {
  const bom = "FEFF";
  let out = bom;
  for (let i = 0; i < s.length; i++) {
    out += s.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0");
  }
  return out;
}

function escapePdfAscii(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export const PROFILE_PDF_PATHS = {
  en: "public/downloads/cyberskill-profile-en.pdf",
  vi: "public/downloads/cyberskill-profile-vi.pdf",
} as const;
