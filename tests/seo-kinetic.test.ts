// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KineticText } from "@/components/motion/KineticText";
// @ts-ignore
import { JSDOM } from "jsdom";

describe("FR-SEO-010: Kinetic Spacing", () => {
  it("seo/kinetic-heading-text: preserves word boundaries in serialized text content (FR-SEO-010 §1.1)", () => {
    const html = renderToStaticMarkup(
      createElement("h2", { "aria-label": "The arc of a wish" }, 
        createElement(KineticText, { text: "The arc of a wish" })
      )
    );

    // Verify it contains the visually hidden space span
    expect(html).toContain('class="cs-visually-hidden"');
    
    // Parse using JSDOM to check textContent serialization (crawlers ignore ARIA)
    const dom = new JSDOM(html);
    const textContent = dom.window.document.querySelector("h2")?.textContent;
    
    // Extracted text must contain space boundaries
    expect(textContent?.trim()).toBe("The arc of a wish");
  });

  it("keeps visual spans aria-hidden (FR-SEO-010 §1.2)", () => {
    const html = renderToStaticMarkup(
      createElement(KineticText, { text: "Turn Your Will Into Real" })
    );

    const dom = new JSDOM(`<div>${html}</div>`);
    const wordSpans = dom.window.document.querySelectorAll(".cs-kt-word");
    
    expect(wordSpans.length).toBeGreaterThan(0);
    wordSpans.forEach((span: any) => {
      expect(span.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
