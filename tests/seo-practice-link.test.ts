import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { company } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { locales } from "@/lib/i18n/config";

// TASK-SEO-022. The Bing keyword report for 2026-07-29 is almost entirely CCAF
// mock-exam intent, all of which is served by practice.cyberskill.world - and a
// grep for that host across lib, app and components returned nothing. The
// subdomain carrying the site's whole organic demand had no inbound link from
// the domain that has the authority.

const PRACTICE_URL = "https://practice.cyberskill.world";

function footerHtml(locale: (typeof locales)[number]): string {
  return renderToStaticMarkup(
    createElement(SiteFooter, { locale, dict: getDictionary(locale) }),
  );
}

describe("seo/practice-link-present (TASK-SEO-022 §1.1)", () => {
  it("renders an anchor to the practice subdomain in the site-wide footer", () => {
    for (const locale of locales) {
      const html = footerHtml(locale);
      expect(html).toContain(`href="${PRACTICE_URL}"`);
    }
  });

  it("emits it as a real href in server-rendered markup, not a script-driven navigation", () => {
    // The footer is server-rendered on every route, so a crawler that never
    // executes JavaScript still finds the link.
    const html = footerHtml("en");
    const anchor = html.match(new RegExp(`<a[^>]*href="${PRACTICE_URL}"[^>]*>.*?</a>`))?.[0];
    expect(anchor, "no anchor element found for the practice URL").toBeDefined();
    expect(anchor).toContain("</a>");
  });
});

describe("seo/practice-link-descriptive (TASK-SEO-022 §1.2)", () => {
  // Same denylist shape the descriptive-link-text work (TASK-SEO-013) enforces.
  const GENERIC = ["click here", "learn more", "read more", "here", "link", "this page"];

  it("uses link text that describes the destination", () => {
    for (const locale of locales) {
      const label = getDictionary(locale).footer.practice;
      expect(label.length).toBeGreaterThan(10);
      expect(GENERIC).not.toContain(label.trim().toLowerCase());
    }
  });

  it("does not use a bare URL as the label", () => {
    for (const locale of locales) {
      const label = getDictionary(locale).footer.practice;
      expect(label.includes("http")).toBe(false);
      expect(label.includes("cyberskill.world")).toBe(false);
    }
  });

  it("carries the query intent the destination ranks for", () => {
    // The report's demand is "claude certified architect" / CCAF mock exam.
    for (const locale of locales) {
      expect(getDictionary(locale).footer.practice.toLowerCase()).toContain("claude certified architect");
    }
  });
});

describe("seo/practice-link-bilingual (TASK-SEO-022 §1.3)", () => {
  it("defines the label in both dictionaries", () => {
    for (const locale of locales) {
      const label = getDictionary(locale).footer.practice;
      expect(typeof label).toBe("string");
      expect(label.trim().length).toBeGreaterThan(0);
    }
  });

  it("does not ship the English string as the Vietnamese one", () => {
    expect(getDictionary("vi").footer.practice).not.toBe(getDictionary("en").footer.practice);
  });

  it("renders the locale's own label in the locale's footer", () => {
    for (const locale of locales) {
      expect(footerHtml(locale)).toContain(getDictionary(locale).footer.practice);
    }
  });
});

describe("seo/practice-link-single-source (TASK-SEO-022 §1.4)", () => {
  it("resolves the URL from the site config", () => {
    expect(company.properties.practice).toBe(PRACTICE_URL);
  });

  it("appears exactly once as a literal in the product source tree", () => {
    const SKIP = new Set(["node_modules", ".next", ".git", "docs", "tests", "public", ".cyberos"]);
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name.startsWith(".") || SKIP.has(name)) continue;
        const p = path.join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(p)) files.push(p);
      }
    };
    for (const root of ["app", "lib", "components"]) walk(path.join(process.cwd(), root));

    const hits = files.filter((f) => readFileSync(f, "utf8").includes(`"${PRACTICE_URL}"`));
    expect(hits.map((f) => path.relative(process.cwd(), f))).toEqual(["lib/content/site.ts"]);
  });
});

describe("seo/practice-link-follows (TASK-SEO-022 §1.5)", () => {
  it("carries no nofollow or sponsored rel token", () => {
    const html = footerHtml("en");
    const anchor = html.match(new RegExp(`<a[^>]*href="${PRACTICE_URL}"[^>]*>`))?.[0] ?? "";

    expect(anchor).not.toContain("nofollow");
    expect(anchor).not.toContain("sponsored");
    expect(anchor).not.toContain("ugc");
  });

  it("keeps noopener, which is required by target=_blank and does not block authority (§3)", () => {
    const anchor = footerHtml("en").match(new RegExp(`<a[^>]*href="${PRACTICE_URL}"[^>]*>`))?.[0] ?? "";
    if (anchor.includes('target="_blank"')) expect(anchor).toContain("noopener");
  });
});
