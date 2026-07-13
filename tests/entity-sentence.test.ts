// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { company } from "@/lib/content/site";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { SiteFooter } from "@/components/footer/SiteFooter";
import LitePage from "@/app/[lang]/lite/page";
import PrivacyPage from "@/app/[lang]/privacy/page";
import { resolveMetadata } from "@/lib/content/metadata";

describe("FR-SEO-018: Canonical Entity Sentence Single-Source & Reuse", () => {
  const locales = ["en", "vi"] as const;

  locales.forEach((locale) => {
    describe(`locale: ${locale}`, () => {
      const sentence = company.entity[locale];

      it("displays the exact sentence in Organization JSON-LD", () => {
        const html = renderToStaticMarkup(createElement(OrganizationJsonLd, { locale }));
        expect(html).toContain(sentence);
      });

      it("displays the exact sentence in Site Footer", () => {
        const mockDict = {
          footer: { privacy: "Privacy", accessibility: "Accessibility", rights: "All rights reserved" },
          nav: { skipToContent: "Skip" }
        } as any;
        const html = renderToStaticMarkup(createElement(SiteFooter, { locale, dict: mockDict }));
        expect(html).toContain(sentence);
      });

      it("displays the exact sentence in Lite Page body", async () => {
        const mockDict = {
          hero: { ctaPrimary: "CTA" },
          a11y: { cinematicLink: "Cinematic" }
        } as any;
        
        // LitePage is an async server component, so we call it or resolve it
        const LiteComponent = await LitePage({ params: Promise.resolve({ lang: locale }) });
        const html = renderToStaticMarkup(LiteComponent);
        expect(html).toContain(sentence);
      });

      it("displays the exact sentence in Privacy Page body", async () => {
        const PrivacyComponent = await PrivacyPage({ params: Promise.resolve({ lang: locale }) });
        const html = renderToStaticMarkup(PrivacyComponent);
        expect(html).toContain(sentence);
      });

      it("uses the sentence as the fallback description when route metadata is absent", () => {
        const meta = resolveMetadata(locale, "/lite");
        expect(meta.description).toBe(company.entity[locale]);
      });
    });
  });
});
