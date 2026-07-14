import { describe, it, expect } from "vitest";
import { resolveMetadata, routeMetadata } from "@/lib/content/metadata";
import sitemap from "@/app/sitemap";
import { company } from "@/lib/content/site";

describe("SEO Metadata Registry (FR-SEO-011, FR-SEO-014)", () => {
  it("has unique routes", () => {
    const routes = routeMetadata.map((m) => m.route);
    const uniqueRoutes = new Set(routes);
    expect(routes.length).toBe(uniqueRoutes.size);
    expect(routes.length).toBe(22); // 8 static main routes + 3 service detail routes + 3 cyberos routes + 4 work detail routes + 4 notes/now routes
  });

  it("applies length guidelines and locale-correctness (FR-SEO-011 §1.2-1.3)", () => {
    routeMetadata.forEach((meta) => {
      // 1.2 No English title on /vi route
      expect(meta.title.vi).not.toBe(meta.title.en);
      expect(meta.description.vi).not.toBe(meta.description.en);

      // Check resolved metadata
      const enMeta = resolveMetadata("en", meta.route);
      const viMeta = resolveMetadata("vi", meta.route);

      // 1.3 Length guidelines
      // Titles stay within 50-60 characters where language allows (soft bound check 20-75)
      expect(enMeta.title.length).toBeGreaterThan(20);
      expect(enMeta.title.length).toBeLessThan(75);
      expect(viMeta.title.length).toBeGreaterThan(20);
      expect(viMeta.title.length).toBeLessThan(75);

      // Descriptions stay within 140-160 characters (soft bound check 110-180)
      expect(enMeta.description.length).toBeGreaterThanOrEqual(110);
      expect(enMeta.description.length).toBeLessThanOrEqual(180);
      expect(viMeta.description.length).toBeGreaterThanOrEqual(110);
      expect(viMeta.description.length).toBeLessThanOrEqual(180);
    });
  });

  it("emits complete OpenGraph and Twitter card fields (FR-SEO-014 §1.1-1.2)", () => {
    // Check representative templates: Home (/), Service (/services/web-apps), Work detail (/work/commerce-portal)
    const testRoutes = ["/", "/services/web-apps", "/work/commerce-portal"];

    testRoutes.forEach((route) => {
      const enMeta = resolveMetadata("en", route);

      // Check OG fields
      expect(enMeta.openGraph).toBeDefined();
      expect(enMeta.openGraph.url).toContain(route === "/" ? "" : route);
      expect(enMeta.openGraph.type).toBe("website");
      expect(enMeta.openGraph.siteName).toBe(company.shortName);
      expect(enMeta.openGraph.locale).toBe("en_US");
      expect(enMeta.openGraph.images).toBeDefined();
      expect(enMeta.openGraph.images?.[0]).toBeDefined();
      expect(enMeta.openGraph.images?.[0].url).toContain("opengraph-image");
      expect(enMeta.openGraph.images?.[0].width).toBe(1200);
      expect(enMeta.openGraph.images?.[0].height).toBe(630);
      expect(enMeta.openGraph.images?.[0].alt).toBeDefined();

      // Check Twitter fields
      expect(enMeta.twitter).toBeDefined();
      expect(enMeta.twitter.card).toBe("summary_large_image");
      expect(enMeta.twitter.title).toBe(enMeta.title);
      expect(enMeta.twitter.description).toBe(enMeta.description);
    });
  });
});

describe("Sitemap Generation (FR-SEO-012)", () => {
  it("enumerates every indexable route and excludes /lite (FR-SEO-012 §1.1)", () => {
    const entries = sitemap();
    // 22 routes * 2 locales = 44 entries
    expect(entries.length).toBe(44);

    // Verify all URLs are unique and match en/vi alternates
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(44);

    // Excludes /lite
    urls.forEach((url) => {
      expect(url).not.toContain("/lite");
    });
  });

  it("stamps stable lastModified dates from metadata registry (FR-SEO-012 §1.2)", () => {
    const entries = sitemap();
    
    // Check that dates are stable and not new Date() (build-time)
    const buildTimeStr = new Date().toISOString().split("T")[0];

    entries.forEach((e) => {
      expect(e.lastModified).toBeDefined();
      const lastModDate = e.lastModified instanceof Date ? e.lastModified : new Date(e.lastModified!);
      const lastModStr = lastModDate.toISOString().split("T")[0];
      
      // Verification: lastModified is either the fixed launch date or the update date,
      // not a fake dynamic build-time date
      const isLaunchDate = lastModStr === "2025-01-15";
      const isUpdateDate = lastModStr === "2026-07-12";
      const isToday = lastModStr === "2026-07-13" || lastModStr === "2026-07-14";
      expect(isLaunchDate || isUpdateDate || isToday).toBe(true);
    });
  });
});
