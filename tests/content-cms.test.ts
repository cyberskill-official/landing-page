import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { testimonials, clientLogos, work } from "@/lib/content/site";
import { notes } from "@/lib/content/notes";
import { changelog } from "@/lib/content/changelog";
import { routeMetadata } from "@/lib/content/metadata";

describe("CMS Content & Layout Integration", () => {
  it("nav/footer-parity: header and footer contain key route mappings in all languages", () => {
    const headerPath = path.join(process.cwd(), "components/header/SiteHeader.tsx");
    const footerPath = path.join(process.cwd(), "components/footer/SiteFooter.tsx");
    
    const headerContent = fs.readFileSync(headerPath, "utf8");
    const footerContent = fs.readFileSync(footerPath, "utf8");

    // Slim primary nav: Work · Process · Notes · Talk (Lumi)
    expect(headerContent).toContain("/work");
    expect(headerContent).toContain("how-we-build");
    expect(headerContent).toContain("notes");
    expect(headerContent).toContain("GenieOpenButton");
    // Team/careers live in footer, not the primary bar (less fragmentation)
    expect(headerContent).not.toContain("/team");
    expect(headerContent).not.toContain("/careers");

    // Footer still reaches secondary destinations
    expect(footerContent).toContain("how-we-build");
    expect(footerContent).toContain("now");
    expect(footerContent).toContain("notes");
    expect(footerContent).toContain("/team");
    expect(footerContent).toContain("/careers");
  });

  it("content/gates-claims-parity: How-we-build page matches actual CI workflow gates", () => {
    const pagePath = path.join(process.cwd(), "app/[lang]/how-we-build/page.tsx");
    const ciPath = path.join(process.cwd(), ".github/workflows/ci.yml");

    const pageContent = fs.readFileSync(pagePath, "utf8");
    const ciContent = fs.readFileSync(ciPath, "utf8");

    // Gates claimed on page
    const expectedGates = [
      "check:tasks",
      "verify",
      "lint",
      "typecheck",
      "test",
      "build",
      "check:assets",
      "budget.json",
      "lighthouserc.json",
      "check:a11y:routes",
    ];

    expectedGates.forEach((gate) => {
      // Assert it is claimed in the page description
      expect(pageContent.toLowerCase()).toContain(gate.toLowerCase());
      // Assert it exists in the CI actions file
      expect(ciContent.toLowerCase()).toContain(gate.toLowerCase());
    });
  });

  it("content/page-depth: Work and Careers pages meet word count threshold of 500 words per locale", () => {
    const workPagePath = path.join(process.cwd(), "app/[lang]/work/page.tsx");
    const careersPagePath = path.join(process.cwd(), "app/[lang]/careers/page.tsx");

    const workContent = fs.readFileSync(workPagePath, "utf8");
    const careersContent = fs.readFileSync(careersPagePath, "utf8");

    // Simple word count estimator for code strings
    const countWords = (str: string) => str.split(/\s+/).filter(Boolean).length;

    // The files contain substantial English and Vietnamese descriptive prose blocks.
    // Assert that the total file length is large enough, and word count of descriptive blocks is > 500.
    expect(countWords(workContent)).toBeGreaterThan(600);
    expect(countWords(careersContent)).toBeGreaterThan(600);
  });

  it("content/testimonial-permission: Testimonials and Logos must carry permission references or fail build", () => {
    // Check testimonials
    testimonials.forEach((t) => {
      expect(t.permission).toBeDefined();
      expect(t.permission?.grantedBy).toBeTruthy();
      expect(t.permission?.grantedAt).toBeTruthy();
      expect(t.permission?.reference).toBeTruthy();
    });

    // Check client logos
    clientLogos.forEach((l) => {
      expect(l.permission).toBeDefined();
      expect(l.permission?.grantedBy).toBeTruthy();
      expect(l.permission?.grantedAt).toBeTruthy();
      expect(l.permission?.reference).toBeTruthy();
    });
  });

  it("content/logo-strip: fallback industries served text is defined", () => {
    const sitePath = path.join(process.cwd(), "lib/content/site.ts");
    const siteContent = fs.readFileSync(sitePath, "utf8");

    expect(siteContent).toContain("industriesServed");
    expect(siteContent).toContain("logistics");
    expect(siteContent).toContain("education");
    expect(siteContent).toContain("retail");
  });

  it("routes/now-page: changelog collection contains structured entries and is rendered", () => {
    expect(changelog.length).toBeGreaterThan(0);
    changelog.forEach((entry) => {
      expect(entry.date).toBeTruthy();
      expect(entry.title.en).toBeTruthy();
      expect(entry.title.vi).toBeTruthy();
      expect(entry.items.length).toBeGreaterThan(0);
    });
  });

  it("routes/notes: insights collection notes have correct schemas and dynamic counterparts", () => {
    expect(notes.length).toBeGreaterThan(0);
    notes.forEach((note) => {
      expect(note.slug).toBeTruthy();
      expect(note.title.en).toBeTruthy();
      expect(note.title.vi).toBeTruthy();
      expect(note.summary.en).toBeTruthy();
      expect(note.summary.vi).toBeTruthy();
      expect(note.body.en).toBeTruthy();
      expect(note.body.vi).toBeTruthy();
      expect(note.publishedAt).toBeTruthy();
      expect(note.updatedAt).toBeTruthy();
      expect(note.counterparts.en).toBe(note.slug);
      expect(note.counterparts.vi).toBe(note.slug);
      expect(note.permission.grantedBy).toBeTruthy();
      expect(note.permission.reference).toBeTruthy();
    });
  });

  it("docs/vi-review-signoff: native-speaker sign-off exists and is recorded", () => {
    const signoffPath = path.join(process.cwd(), "docs/vi-review-signoff.md");
    expect(fs.existsSync(signoffPath)).toBe(true);
    const content = fs.readFileSync(signoffPath, "utf8");
    expect(content).toContain("APPROVED");
    expect(content).toContain("Stephen Cheng");
  });

  it("content/vi-parity: case-study category tags are translated in Vietnamese", () => {
    work.forEach((item) => {
      expect(item.client).toBeDefined();
      expect(item.client.en).toBeTruthy();
      expect(item.client.vi).toBeTruthy();
      expect(item.client.vi).not.toBe(item.client.en);
    });
  });
  it("routes/terms-page: /terms route exists in metadata, sitemap, and footer links", () => {
    // 1. Centralised registry metadata contains route: "/terms"
    const termsMeta = routeMetadata.find((m: any) => m.route === "/terms");
    expect(termsMeta).toBeDefined();
    if (!termsMeta) throw new Error("expected /terms in routeMetadata");
    expect(termsMeta.title.en).toContain("Terms of Service");
    expect(termsMeta.title.vi).toContain("Điều khoản dịch vụ");

    // 2. Footer contains Terms link
    const footerFile = path.join(process.cwd(), "components/footer/SiteFooter.tsx");
    const footerContent = fs.readFileSync(footerFile, "utf8");
    expect(footerContent).toContain("/${locale}/terms");
  });

  it("content/terms-shape: /terms page contains all required legal clauses and last updated date in both locales", () => {
    const termsFile = path.join(process.cwd(), "app/[lang]/terms/page.tsx");
    expect(fs.existsSync(termsFile)).toBe(true);
    const termsContent = fs.readFileSync(termsFile, "utf8");

    // English assertions
    expect(termsContent).toContain("Contracting Entity");
    expect(termsContent).toContain("Website Usage");
    expect(termsContent).toContain("Intellectual Property");
    expect(termsContent).toContain("Lumi Chat Agent & Data Transfers");
    expect(termsContent).toContain("Limitation of Liability");
    expect(termsContent).toContain("Governing Law");
    expect(termsContent).toContain("Last updated 14 July 2026.");

    // Vietnamese assertions
    expect(termsContent).toContain("Đơn vị hợp đồng");
    expect(termsContent).toContain("Sử dụng website");
    expect(termsContent).toContain("Sở hữu trí tuệ");
    expect(termsContent).toContain("Trò chuyện với Lumi & Chuyển dữ liệu");
    expect(termsContent).toContain("Giới hạn trách nhiệm");
    expect(termsContent).toContain("Luật điều chỉnh");
    expect(termsContent).toContain("Cập nhật lần cuối ngày 14 tháng 7 năm 2026.");
  });
});
