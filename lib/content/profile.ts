import { createRequire } from "node:module";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { Locale } from "@/lib/i18n/config";
import { company, services } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";
import { localize } from "@/lib/i18n/types";

/**
 * FR-CTA-016: company profile one-pager facts from the publishable content SSOT.
 * Every line must be traceable to lib/content (policy / site) — no invented claims.
 *
 * PDFs are built with PDFKit + embedded DejaVu Sans (Unicode / Vietnamese diacritics).
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
      text: `${localize(s.title, locale)} - ${localize(s.summary, locale)}`,
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
    ? `Hồ sơ công ty - ${company.shortName}`
    : `Company profile - ${company.shortName}`;
}

export function resolveProfileFontPath(
  cwd: string = process.cwd(),
): string {
  const candidates = [
    join(cwd, "assets/fonts/DejaVuSans.ttf"),
    join(cwd, "assets/fonts/NotoSans-Regular.ttf"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    "Profile PDF font missing: place DejaVuSans.ttf under assets/fonts/ (Unicode/Vietnamese).",
  );
}

/**
 * Build a Unicode-capable PDF (embedded TTF) for the company profile.
 * Server/Node only — used by the generate script and tests, not imported into client components.
 */
export async function buildProfilePdf(locale: Locale): Promise<Uint8Array> {
  const require = createRequire(import.meta.url);
  // pdfkit is CJS; under ESM interop the constructor may be on .default
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfkitMod = require("pdfkit") as unknown;
  type PdfDoc = {
    on: (ev: string, cb: (...args: never[]) => void) => void;
    registerFont: (name: string, path: string) => void;
    font: (name: string) => PdfDoc;
    fontSize: (n: number) => PdfDoc;
    fillColor: (c: string) => PdfDoc;
    text: (s: string, opts?: object) => PdfDoc;
    moveDown: (n?: number) => PdfDoc;
    end: () => void;
  };
  type PdfCtor = new (opts?: object) => PdfDoc;
  const PDFDocument: PdfCtor =
    typeof pdfkitMod === "function"
      ? (pdfkitMod as PdfCtor)
      : (pdfkitMod as { default: PdfCtor }).default;

  const title = getProfileTitle(locale);
  const facts = getProfileFacts(locale);
  const fontPath = resolveProfileFontPath();
  // Touch font so missing path fails early with a clear error
  readFileSync(fontPath);

  const doc = new PDFDocument({
    size: "LETTER",
    margin: 54,
    info: {
      Title: title,
      Author: company.legalName,
      Subject: "Company profile",
      Creator: "CyberSkill landing page",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  const done = new Promise<Uint8Array>((resolve, reject) => {
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    doc.on("error", reject);
  });

  doc.registerFont("Profile", fontPath);
  doc.font("Profile");

  doc.fontSize(16).text(title, { align: "left" });
  doc.moveDown(0.6);
  doc.fontSize(10).fillColor("#333333");

  for (const f of facts) {
    doc.text(f.text, {
      align: "left",
      lineGap: 2,
      width: 504,
    });
    doc.moveDown(0.35);
  }

  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#666666").text(company.url);

  doc.end();
  const bytes = await done;

  if (bytes.byteLength > 1024 * 1024) {
    throw new Error(`Profile PDF for ${locale} exceeds 1 MB (${bytes.byteLength})`);
  }
  return bytes;
}

export const PROFILE_PDF_PATHS = {
  en: "public/downloads/cyberskill-profile-en.pdf",
  vi: "public/downloads/cyberskill-profile-vi.pdf",
} as const;
