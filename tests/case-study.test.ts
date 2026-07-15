// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WorkDetailPage from "@/app/[lang]/work/[slug]/page";

describe("TASK-CMS-011: Case Study Proof Template", () => {
  it("content/case-study-template: fully populated case study renders every block (AC 1.1, 1.4)", async () => {
    const element = await WorkDetailPage({
      params: Promise.resolve({ lang: "en", slug: "operations-platform" }),
    });
    const html = renderToStaticMarkup(element);

    // Renders challenge, approach, outcome
    expect(html).toContain("The challenge");
    expect(html).toContain("What we did");
    expect(html).toContain("The outcome");

    // Renders tech stack
    expect(html).toContain("Tech stack");
    expect(html).toContain("React");
    expect(html).toContain("Next.js");

    // Renders metrics
    expect(html).toContain("Measured outcomes");
    expect(html).toContain("99.9%");
    expect(html).toContain("Data reconciliation accuracy");

    // Renders source note
    expect(html).toContain("Source: Internal audit over 6 months post-launch");
  });

  it("content/case-study-template: NDA case study renders without name (AC 1.2)", async () => {
    const element = await WorkDetailPage({
      params: Promise.resolve({ lang: "en", slug: "operations-platform" }),
    });
    const html = renderToStaticMarkup(element);

    // Should display NDA metadata as eyebrow
    expect(html).toContain("Logistics, 50-100 staff, Vietnam");
    // Should NOT display a named client identity
    expect(html).not.toContain("EduSpark Vietnam");
  });

  it("content/case-study-template: case study with zero metrics renders anonymized pattern label (AC 1.3)", async () => {
    const element = await WorkDetailPage({
      params: Promise.resolve({ lang: "en", slug: "legacy-migration" }),
    });
    const html = renderToStaticMarkup(element);

    // Renders anonymized pattern banner
    expect(html).toContain("Anonymized pattern");
    expect(html).toContain("This project is presented as an anonymized pattern");
    
    // Renders tech stack
    expect(html).toContain("AWS");
    expect(html).toContain("Terraform");

    // No metrics block should be present
    expect(html).not.toContain("Measured outcomes");
  });

  it("content/vi-parity: VN pages show localized category tags (AC 1.5)", async () => {
    // EN page
    const elementEn = await WorkDetailPage({
      params: Promise.resolve({ lang: "en", slug: "commerce-portal" }),
    });
    const htmlEn = renderToStaticMarkup(elementEn);
    expect(htmlEn).toContain("Web apps");

    // VN page
    const elementVn = await WorkDetailPage({
      params: Promise.resolve({ lang: "vi", slug: "commerce-portal" }),
    });
    const htmlVn = renderToStaticMarkup(elementVn);
    expect(htmlVn).toContain("Ứng dụng web");
  });
});
