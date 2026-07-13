// @vitest-environment jsdom
import { expect, test, describe } from "vitest";
import { generateStaticParams } from "@/app/[lang]/services/[slug]/page";
import ServiceDetailPage from "@/app/[lang]/services/[slug]/page";
import { company, testimonials } from "@/lib/content/site";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import { JSDOM } from "jsdom";

describe("Commit 4 tests — FR-SEO-015, FR-SEO-016", () => {
  // --- FR-SEO-016: Service Paths ---
  test("routing/service-paths: generateStaticParams returns paths for all services in both locales", () => {
    const paths = generateStaticParams();
    expect(paths).toContainEqual({ lang: "en", slug: "web-apps" });
    expect(paths).toContainEqual({ lang: "vi", slug: "web-apps" });
    expect(paths).toContainEqual({ lang: "en", slug: "mobile-apps" });
    expect(paths).toContainEqual({ lang: "vi", slug: "mobile-apps" });
    expect(paths).toContainEqual({ lang: "en", slug: "internal-systems" });
    expect(paths).toContainEqual({ lang: "vi", slug: "internal-systems" });
  });

  // --- FR-SEO-015: Service and review schema ---
  test("seo/service-ld-review: renders review and aggregateRating when rated testimonials are present", async () => {
    // Inject a mock rated testimonial
    testimonials.push({
      quote: { en: "Outstanding delivery and senior craftsmanship.", vi: "Giao sản phẩm xuất sắc và tay nghề cao." },
      author: "Jane Doe",
      role: { en: "VP of Engineering", vi: "Phó giám đốc kỹ thuật" },
      company: "Acme Corp",
      rating: 5,
    });

    const page = await ServiceDetailPage({ params: Promise.resolve({ lang: "en", slug: "web-apps" }) });
    const html = renderToStaticMarkup(page);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Retrieve schema script
    const scripts = doc.querySelectorAll("script[type='application/ld+json']");
    const script = Array.from(scripts).find((s: any) => s.textContent?.includes('"@type": "Service"') || s.textContent?.includes('"@type":"Service"')) as any;
    expect(script).toBeTruthy();

    const ld = JSON.parse(script?.textContent || "{}");
    expect(ld["@type"]).toBe("Service");
    expect(ld.provider["@id"]).toContain("#organization");
    expect(ld.provider.name).toBe(company.shortName);

    // Reviews should be present
    expect(ld.review).toBeDefined();
    expect(ld.review.length).toBe(1);
    expect(ld.review[0]["@type"]).toBe("Review");
    expect(ld.review[0].author.name).toBe("Jane Doe");
    expect(ld.review[0].reviewRating.ratingValue).toBe(5);

    // Aggregate rating should be present
    expect(ld.aggregateRating).toBeDefined();
    expect(ld.aggregateRating["@type"]).toBe("AggregateRating");
    expect(ld.aggregateRating.ratingValue).toBe(5);
    expect(ld.aggregateRating.reviewCount).toBe(1);

    // Clean up testimonials array
    testimonials.pop();
  });

  test("seo/service-ld-review: does not render reviews when no rated testimonials are present", async () => {
    const page = await ServiceDetailPage({ params: Promise.resolve({ lang: "en", slug: "web-apps" }) });
    const html = renderToStaticMarkup(page);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const scripts = doc.querySelectorAll("script[type='application/ld+json']");
    const script = Array.from(scripts).find((s: any) => s.textContent?.includes('"@type": "Service"') || s.textContent?.includes('"@type":"Service"')) as any;
    expect(script).toBeTruthy();
    
    const ld = JSON.parse(script?.textContent || "{}");
    
    expect(ld.review).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
  });

  // --- FR-SEO-016: FAQPage JSON-LD Schema ---
  test("seo/service-faq-jsonld: renders FAQPage schema correctly", async () => {
    const page = await ServiceDetailPage({ params: Promise.resolve({ lang: "en", slug: "web-apps" }) });
    const html = renderToStaticMarkup(page);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const scripts = doc.querySelectorAll("script[type='application/ld+json']");
    const script = Array.from(scripts).find((s: any) => s.textContent?.includes('"@type": "FAQPage"') || s.textContent?.includes('"@type":"FAQPage"')) as any;
    expect(script).toBeTruthy();

    const ld = JSON.parse(script?.textContent || "{}");
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toBeDefined();
    expect(ld.mainEntity.length).toBeGreaterThanOrEqual(4);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
  });
});
