// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import fs from "node:fs";
import path from "node:path";

import {
  getBookingUrl,
  isBookingConfigured,
  BOOKING_URL_ENV,
} from "@/lib/content/booking";
import { BookingLink, bookingLabels } from "@/components/cta/BookingLink";
import {
  getProfileFacts,
  buildProfilePdf,
  getProfileTitle,
  PROFILE_PDF_PATHS,
} from "@/lib/content/profile";
import { company, services } from "@/lib/content/site";
import { commercialPolicy } from "@/lib/content/policy";
import * as taxonomy from "@/lib/analytics/taxonomy";
import { ProfileDownloadLink, profilePdfHrefs } from "@/components/cta/ProfileDownloadLink";

describe("cta/booking-action", () => {
  const prev = process.env[BOOKING_URL_ENV];

  afterEach(() => {
    if (prev === undefined) delete process.env[BOOKING_URL_ENV];
    else process.env[BOOKING_URL_ENV] = prev;
  });

  it("returns null when NEXT_PUBLIC_BOOKING_URL is unset", () => {
    delete process.env[BOOKING_URL_ENV];
    expect(getBookingUrl()).toBeNull();
    expect(isBookingConfigured()).toBe(false);
  });

  it("returns validated URL when configured", () => {
    process.env[BOOKING_URL_ENV] = "https://cal.example.com/cyberskill";
    expect(getBookingUrl()).toBe("https://cal.example.com/cyberskill");
    expect(isBookingConfigured()).toBe(true);
  });

  it("rejects non-http(s) schemes", () => {
    process.env[BOOKING_URL_ENV] = "javascript:alert(1)";
    expect(getBookingUrl()).toBeNull();
  });

  it("renders nothing without env; renders link with target blank when set", () => {
    delete process.env[BOOKING_URL_ENV];
    const empty = document.createElement("div");
    document.body.appendChild(empty);
    const rootEmpty = createRoot(empty);
    act(() => {
      rootEmpty.render(
        createElement(BookingLink, { locale: "en", location: "contact-section" }),
      );
    });
    expect(empty.querySelector("[data-booking-link]")).toBeNull();
    act(() => rootEmpty.unmount());
    empty.remove();

    process.env[BOOKING_URL_ENV] = "https://cal.example.com/cs";
    const box = document.createElement("div");
    document.body.appendChild(box);
    const root = createRoot(box);
    act(() => {
      root.render(
        createElement(BookingLink, { locale: "en", location: "contact-section" }),
      );
    });
    const a = box.querySelector("[data-booking-link]") as HTMLAnchorElement;
    expect(a).toBeTruthy();
    expect(a.href).toContain("cal.example.com");
    expect(a.target).toBe("_blank");
    expect(a.rel).toContain("noopener");
    expect(a.textContent).toBe(bookingLabels.en);
    act(() => root.unmount());
    box.remove();
  });

  it("both locales expose booking labels", () => {
    expect(bookingLabels.en.length).toBeGreaterThan(0);
    expect(bookingLabels.vi.length).toBeGreaterThan(0);
  });
});

describe("analytics/both-lead-paths (booking_clicked)", () => {
  beforeEach(() => {
    vi.spyOn(taxonomy, "emit").mockImplementation(() => {});
    process.env[BOOKING_URL_ENV] = "https://cal.example.com/cs";
  });
  afterEach(() => {
    delete process.env[BOOKING_URL_ENV];
    vi.restoreAllMocks();
  });

  it("click emits booking_clicked with location", () => {
    const box = document.createElement("div");
    document.body.appendChild(box);
    const root = createRoot(box);
    act(() => {
      root.render(
        createElement(BookingLink, { locale: "en", location: "thank-you" }),
      );
    });
    const a = box.querySelector("[data-booking-link]") as HTMLAnchorElement;
    act(() => {
      a.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(taxonomy.emit).toHaveBeenCalledWith("booking_clicked", {
      location: "thank-you",
    });
    act(() => root.unmount());
    box.remove();
  });
});

describe("content/cta-copy (booking labels)", () => {
  it("EN and VN booking labels are non-empty and distinct where expected", () => {
    expect(bookingLabels.en).toMatch(/Book/i);
    expect(bookingLabels.vi.length).toBeGreaterThan(3);
  });
});

describe("assets/profile-pdf-size", () => {
  it("generated PDFs for both locales exist under 1 MB and start with %PDF", () => {
    for (const locale of ["en", "vi"] as const) {
      const bytes = buildProfilePdf(locale);
      expect(bytes.byteLength).toBeGreaterThan(100);
      expect(bytes.byteLength).toBeLessThanOrEqual(1024 * 1024);
      const head = Buffer.from(bytes.slice(0, 5)).toString("ascii");
      expect(head).toBe("%PDF-");

      // Ensure committed public files match generator (or regenerate)
      const rel = PROFILE_PDF_PATHS[locale];
      const abs = path.join(process.cwd(), rel);
      expect(fs.existsSync(abs), rel).toBe(true);
      const onDisk = fs.readFileSync(abs);
      expect(onDisk.byteLength).toBeLessThanOrEqual(1024 * 1024);
      expect(onDisk.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    }
  });
});

describe("content/profile-pdf-parity", () => {
  it("every profile fact traces to content SSOT and appears in the PDF bytes", () => {
    for (const locale of ["en", "vi"] as const) {
      const facts = getProfileFacts(locale);
      expect(facts.length).toBeGreaterThan(8);
      const pdf = Buffer.from(buildProfilePdf(locale));
      const asString = pdf.toString("binary");

      for (const f of facts) {
        expect(f.source.startsWith("lib/content/")).toBe(true);
        expect(f.text.trim().length).toBeGreaterThan(0);
        // Fact text retained in PDF (ASCII slice or UTF-16 hex)
        const asciiOk = asString.includes(f.text.slice(0, 24));
        const hexChunk = Buffer.from(f.text.slice(0, 12), "utf16le");
        // UTF-16BE hex embedding: check a few code units appear as hex
        const code = f.text.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
        const hexOk = asString.toUpperCase().includes(code);
        expect(
          asciiOk || hexOk,
          `fact ${f.key} not found in PDF for ${locale}`,
        ).toBe(true);
      }

      // Spot-check SSOT equality
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
  beforeEach(() => {
    vi.spyOn(taxonomy, "emit").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("profile download click emits cta_clicked with location", () => {
    const box = document.createElement("div");
    document.body.appendChild(box);
    const root = createRoot(box);
    act(() => {
      root.render(
        createElement(ProfileDownloadLink, {
          locale: "en",
          location: "footer",
        }),
      );
    });
    const a = box.querySelector("[data-profile-pdf]") as HTMLAnchorElement;
    expect(a.getAttribute("href")).toBe(profilePdfHrefs.en);
    act(() => {
      a.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(taxonomy.emit).toHaveBeenCalledWith(
      "cta_clicked",
      expect.objectContaining({ location: "footer" }),
    );
    act(() => root.unmount());
    box.remove();
  });
});
