/**
 * Booking UI tests need jsdom; PDF generation needs Node (pdfkit + TTF).
 * Split via per-suite environment comments is not supported — use node here for
 * PDF suites and dynamic-import jsdom only for component tests, OR run PDF
 * tests under node environment for the whole file and use happy-dom lightly.
 *
 * pdfkit cannot register TTF under vitest jsdom (font_factory fails). Force node.
 *
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import {
  getBookingUrl,
  isBookingConfigured,
  readBookingUrlEnv,
  BOOKING_URL_ENV,
} from "@/lib/content/booking";
import { bookingLabels } from "@/components/cta/BookingLink";
import {
  getProfileFacts,
  buildProfilePdf,
  getProfileTitle,
  resolveProfileFontPath,
  PROFILE_PDF_PATHS,
} from "@/lib/content/profile";
import { company, services } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";
import { profilePdfHrefs } from "@/components/cta/ProfileDownloadLink";

const require = createRequire(import.meta.url);

describe("cta/booking-action", () => {
  it("source uses static process.env.NEXT_PUBLIC_BOOKING_URL (Next client inlining)", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "lib/content/booking.ts"),
      "utf8",
    );
    // Must be a static member expression for Next to replace at build time.
    expect(src).toMatch(/process\.env\.NEXT_PUBLIC_BOOKING_URL/);
    // Dynamic key access is forbidden for the public URL read path.
    expect(src).not.toMatch(/process\.env\s*\[\s*BOOKING_URL_ENV\s*\]/);
    expect(src).not.toMatch(/process\.env\s*\[\s*["']NEXT_PUBLIC_BOOKING_URL["']\s*\]/);
    expect(BOOKING_URL_ENV).toBe("NEXT_PUBLIC_BOOKING_URL");
  });

  it("returns null when NEXT_PUBLIC_BOOKING_URL is unset", () => {
    expect(getBookingUrl(null)).toBeNull();
    expect(isBookingConfigured(null)).toBe(false);
    expect(readBookingUrlEnv(null)).toBeUndefined();
  });

  it("returns validated URL when configured (override path for tests)", () => {
    expect(getBookingUrl("https://cal.example.com/cyberskill")).toBe(
      "https://cal.example.com/cyberskill",
    );
    expect(isBookingConfigured("https://cal.example.com/cyberskill")).toBe(
      true,
    );
  });

  it("rejects non-http(s) schemes", () => {
    expect(getBookingUrl("javascript:alert(1)")).toBeNull();
  });

  it("BookingLink source accepts url prop and does not use dynamic env keys", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/cta/BookingLink.tsx"),
      "utf8",
    );
    expect(src).toMatch(/url\?:/);
    expect(src).toMatch(/getBookingUrl/);
    // Contact section passes server-resolved url
    const contact = fs.readFileSync(
      path.join(process.cwd(), "components/sections/ContactCta.tsx"),
      "utf8",
    );
    expect(contact).toMatch(/getBookingUrl\(\)/);
    expect(contact).toMatch(/url=\{bookingUrl\}/);
  });

  it("both locales expose booking labels", () => {
    expect(bookingLabels.en.length).toBeGreaterThan(0);
    expect(bookingLabels.vi.length).toBeGreaterThan(0);
  });
});

describe("analytics/both-lead-paths (booking_clicked)", () => {
  it("BookingLink click handler emits booking_clicked (source contract)", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/cta/BookingLink.tsx"),
      "utf8",
    );
    expect(src).toMatch(/emit\("booking_clicked"/);
    expect(src).toMatch(/location/);
  });
});

describe("content/cta-copy (booking labels)", () => {
  it("EN and VN booking labels are non-empty", () => {
    expect(bookingLabels.en).toMatch(/Book/i);
    expect(bookingLabels.vi.length).toBeGreaterThan(3);
  });
});

describe("assets/profile-pdf-size", () => {
  it("generated PDFs for both locales are under 1 MB, valid, and embed a Unicode font", async () => {
    const font = resolveProfileFontPath();
    expect(fs.existsSync(font)).toBe(true);

    for (const locale of ["en", "vi"] as const) {
      const bytes = await buildProfilePdf(locale);
      expect(bytes.byteLength).toBeGreaterThan(1000);
      expect(bytes.byteLength).toBeLessThanOrEqual(1024 * 1024);
      const head = Buffer.from(bytes.slice(0, 5)).toString("ascii");
      expect(head).toBe("%PDF-");

      // Embedded font marker (pdfkit subsets TTF)
      const raw = Buffer.from(bytes).toString("latin1");
      expect(raw).toMatch(/FontFile2|CIDFontType0|ToUnicode|DejaVu|Identity-H/);

      // Write/refresh public downloads for integration parity
      const rel = PROFILE_PDF_PATHS[locale];
      const abs = path.join(process.cwd(), rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, bytes);
      expect(fs.existsSync(abs)).toBe(true);
    }
  });
});

describe("content/profile-pdf-parity", () => {
  it("every profile fact traces to content SSOT and is extractable as readable PDF text", async () => {
    // pdf-parse v2: PDFParse class extracts the real text layer (Unicode fonts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse") as {
      PDFParse: new (opts: { data: Buffer }) => {
        getText: () => Promise<{ pages: { text: string }[]; text?: string }>;
      };
    };

    for (const locale of ["en", "vi"] as const) {
      const facts = getProfileFacts(locale);
      expect(facts.length).toBeGreaterThan(8);
      const bytes = await buildProfilePdf(locale);
      const parser = new PDFParse({ data: Buffer.from(bytes) });
      const parsed = await parser.getText();
      const text = (parsed.pages?.map((p) => p.text).join("\n") ?? parsed.text ?? "")
        .replace(/\s+/g, " ");

      for (const f of facts) {
        expect(f.source.startsWith("lib/content/")).toBe(true);
        expect(f.text.trim().length).toBeGreaterThan(0);
        const needle = f.text.replace(/\s+/g, " ").slice(0, 40);
        expect(
          text.includes(needle) || text.includes(f.text.slice(0, 40)),
          `extractable text missing fact ${f.key} (${locale}): ${needle}\n--- extracted ---\n${text.slice(0, 500)}`,
        ).toBe(true);
      }

      // Vietnamese diacritics must survive extraction (not mojibake / omitted)
      if (locale === "vi") {
        expect(text).toMatch(/[ăâêôơưđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i);
        expect(text).toContain(commercialPolicy.ctaPromise.vi.slice(0, 20));
      } else {
        expect(text).toContain(commercialPolicy.ctaPromise.en.slice(0, 20));
      }

      expect(facts.find((f) => f.key === "legalName")?.text).toBe(
        company.legalName,
      );
      expect(facts.find((f) => f.key === "entity")?.text).toBe(
        company.entity[locale],
      );
      expect(facts.find((f) => f.key === "registration")?.text).toBe(
        commercialPolicy.registrationNumber,
      );
      expect(facts.filter((f) => f.key.startsWith("service:")).length).toBe(
        services.length,
      );
      expect(getProfileTitle(locale)).toContain(company.shortName);
    }
  });
});

describe("analytics/both-lead-paths (profile download)", () => {
  it("ProfileDownloadLink emits cta_clicked and points at public PDFs", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/cta/ProfileDownloadLink.tsx"),
      "utf8",
    );
    expect(src).toMatch(/emit\("cta_clicked"/);
    expect(src).toContain(profilePdfHrefs.en);
    expect(src).toContain(profilePdfHrefs.vi);
    expect(
      fs.existsSync(path.join(process.cwd(), "public/downloads/cyberskill-profile-en.pdf")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(process.cwd(), "public/downloads/cyberskill-profile-vi.pdf")),
    ).toBe(true);
  });
});
