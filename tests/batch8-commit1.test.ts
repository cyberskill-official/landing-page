import { describe, it, expect, vi, beforeEach } from "vitest";
import { company, faqs } from "@/lib/content/site";
import { ConsentGate } from "@/lib/analytics/consent";
import nextConfig from "@/next.config";

describe("Commit 1 tests — FR-PERF-010, FR-SEO-019, FR-SEO-020, FR-OPS-013", () => {
  beforeEach(() => {
    // Reset consent gate state before each test
    // Cast to access internal reset
    (ConsentGate as any)._reset();
  });

  // --- FR-PERF-010: Cache headers ---
  it("headers/static-asset-cache: nextConfig contains correct immutable Cache-Control headers for brand, models, logo, favicon, and poster", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (typeof nextConfig.headers === "function") {
      const headers = await nextConfig.headers();
      
      // Find immutable rules
      const brandRule = headers.find((h: any) => h.source === "/brand/:file*");
      const modelsRule = headers.find((h: any) => h.source === "/models/:file*");
      const logoRule = headers.find((h: any) => h.source === "/logo.svg");
      const faviconRule = headers.find((h: any) => h.source === "/favicon.svg");
      const posterRule = headers.find((h: any) => h.source === "/lumi-poster.webp");

      expect(brandRule).toBeDefined();
      expect(modelsRule).toBeDefined();
      expect(logoRule).toBeDefined();
      expect(faviconRule).toBeDefined();
      expect(posterRule).toBeDefined();

      const expectedCacheHeader = { key: "Cache-Control", value: "public, max-age=31536000, immutable" };
      expect(brandRule?.headers).toContainEqual(expectedCacheHeader);
      expect(modelsRule?.headers).toContainEqual(expectedCacheHeader);
      expect(logoRule?.headers).toContainEqual(expectedCacheHeader);
      expect(faviconRule?.headers).toContainEqual(expectedCacheHeader);
      expect(posterRule?.headers).toContainEqual(expectedCacheHeader);
    }
  });

  // --- FR-SEO-019: Organization & LocalBusiness properties ---
  it("seo/organization-jsonld: company configuration has required profiles, founder, geo, and openingHours", () => {
    expect(company.profiles).toBeDefined();
    expect(company.profiles.linkedin).toBe("https://www.linkedin.com/company/cyberskill-world");
    expect(company.profiles.github).toBe("https://github.com/cyberskill-world");
    expect(company.profiles.facebook).toBe("https://www.facebook.com/cyberskill.world");
    expect(company.profiles.x).toBe("https://x.com/cyberskillworld");
    
    expect(company.founder).toBeDefined();
    expect(company.founder.name).toContain("Stephen");
    expect(company.founder.url).toBe("https://www.linkedin.com/in/stephencheng");

    expect(company.geo).toBeDefined();
    expect(company.geo.lat).toBe(10.7909);
    expect(company.geo.lng).toBe(106.6929);

    expect(company.openingHours).toContain("Mo-Fr 09:00-18:00");
  });

  // --- FR-SEO-020: FAQ coverage ---
  it("content/faq-coverage: visible FAQ covers all minimum required topics", () => {
    // 15-20 question/answer pairs per locale
    expect(faqs.length).toBeGreaterThanOrEqual(15);
    expect(faqs.length).toBeLessThanOrEqual(20);

    // Let's check that there are no empty placeholder descriptions
    faqs.forEach((item, index) => {
      expect(item.q.en).toBeTruthy();
      expect(item.q.vi).toBeTruthy();
      expect(item.a.en).toBeTruthy();
      expect(item.a.vi).toBeTruthy();

      // Ensure first sentence answers the question directly (AC 1.4: answers are self-contained and quotable)
      // Usually ends with a period, question mark, or exclamation.
      expect(item.a.en.split(/[.!?]/)[0].trim().length).toBeGreaterThan(5);
      expect(item.a.vi.split(/[.!?]/)[0].trim().length).toBeGreaterThan(5);
    });

    // Check minimum set coverage
    const allQuestionsEn = faqs.map(f => f.q.en.toLowerCase());
    const hasTopic = (keywords: string[]) => 
      allQuestionsEn.some(q => keywords.some(kw => q.includes(kw)));

    expect(hasTopic(["what", "build"])).toBe(true);
    expect(hasTopic(["where", "based", "location"])).toBe(true);
    expect(hasTopic(["how", "start", "project"])).toBe(true);
    expect(hasTopic(["two weeks", "first"])).toBe(true);
    expect(hasTopic(["reply", "fast", "speed"])).toBe(true);
    expect(hasTopic(["international", "clients", "global"])).toBe(true);
    expect(hasTopic(["time-zone", "overlap", "múi giờ"])).toBe(true);
    expect(hasTopic(["seniority", "who will", "senior"])).toBe(true);
    expect(hasTopic(["english", "level", "language"])).toBe(true);
    expect(hasTopic(["tech stack", "stacks"])).toBe(true);
    expect(hasTopic(["maintenance", "support"])).toBe(true);
    expect(hasTopic(["take over", "existing codebase", "codebase"])).toBe(true);
    expect(hasTopic(["intellectual property", "ip", "sở hữu"])).toBe(true);
    expect(hasTopic(["nda", "sign"])).toBe(true);
    expect(hasTopic(["timeline", "long"])).toBe(true);
    expect(hasTopic(["ai chat", "lumi", "data"])).toBe(true);
    expect(hasTopic(["cookies", "tracking"])).toBe(true);
  });

  // --- FR-OPS-013: Consent Gate API ---
  it("analytics/consent-gate: defaults to denied for optional tags and allows functional", () => {
    expect(ConsentGate.canLoad("analytics")).toBe(false);
    expect(ConsentGate.canLoad("session-replay")).toBe(false);
    expect(ConsentGate.canLoad("marketing")).toBe(false);
    expect(ConsentGate.canLoad("functional")).toBe(true);
  });

  it("analytics/consent-gate: allows upgrading consent states", () => {
    expect(ConsentGate.canLoad("analytics")).toBe(false);

    // Upgrade analytics
    (ConsentGate as any)._upgrade({ analytics: true });
    expect(ConsentGate.canLoad("analytics")).toBe(true);
    expect(ConsentGate.canLoad("session-replay")).toBe(false);
    expect(ConsentGate.canLoad("marketing")).toBe(false);

    // Reset back
    (ConsentGate as any)._reset();
    expect(ConsentGate.canLoad("analytics")).toBe(false);
  });
});
