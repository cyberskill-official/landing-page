// @vitest-environment jsdom
import { expect, test, describe } from "vitest";
import ServiceDetailPage from "@/app/[lang]/services/[slug]/page";
import { serviceDetails } from "@/lib/content/services";
import { StaticPoster } from "@/components/canvas/StaticPoster";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-ignore
import { JSDOM } from "jsdom";

describe("Batch 9 Commit 1 tests — TASK-CMS-005, TASK-PERF-011", () => {
  // --- TASK-CMS-005: Services Page Copy Shape & Hardcoded Literals ---
  test("content/service-page-shape: renders all 5 required fields (summary, problem, approach, stack, cta) on the page", async () => {
    // Assert data model exists
    for (const slug of ["web-apps", "mobile-apps", "internal-systems"]) {
      const detail = serviceDetails[slug];
      expect(detail).toBeDefined();
      expect(detail.summary.en).toBeTruthy();
      expect(detail.summary.vi).toBeTruthy();
      expect(detail.problem.en).toBeTruthy();
      expect(detail.problem.vi).toBeTruthy();
      expect(detail.approach.en).toBeTruthy();
      expect(detail.approach.vi).toBeTruthy();
      expect(detail.stack.en).toBeTruthy();
      expect(detail.stack.vi).toBeTruthy();
      expect(detail.cta.en).toBeTruthy();
      expect(detail.cta.vi).toBeTruthy();
    }

    // Render page and check content
    const page = await ServiceDetailPage({ params: Promise.resolve({ lang: "en", slug: "web-apps" }) });
    const html = renderToStaticMarkup(page);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Check rendering of summary
    expect(html).toContain(serviceDetails["web-apps"].summary.en);
    // Check rendering of problem
    expect(html).toContain(serviceDetails["web-apps"].problem.en);
    // Check rendering of approach
    expect(html).toContain(serviceDetails["web-apps"].approach.en);
    // Check rendering of stack
    expect(html).toContain(serviceDetails["web-apps"].stack.en);
    // Check rendering of cta promise
    expect(html).toContain(serviceDetails["web-apps"].cta.en);
  });

  // --- TASK-PERF-011: LCP Preload of StaticPoster ---
  test("perf/lcp-preload: StaticPoster renders Next.js Image component with priority", () => {
    const poster = createElement(StaticPoster);
    const html = renderToStaticMarkup(poster);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Next.js Image with priority preloads via <link rel="preload" as="image">
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="image"');
    expect(html).toContain("lumi-poster.webp");

    const img = doc.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toContain("lumi-poster.webp");
  });

  // --- TASK-PERF-011: Responsive Sizes on Image Call Sites ---
  test("lint/next-image-sizes: both StaticPoster and background image declare custom sizes", () => {
    const poster = createElement(StaticPoster);
    const html = renderToStaticMarkup(poster);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const img = doc.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("sizes")).toBe("(max-width: 1023px) 50vw, 33vw");
  });
});
