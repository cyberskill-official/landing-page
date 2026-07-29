import { describe, it, expect } from "vitest";
import { resolveMetadata, routeMetadata, hreflangAlternates, X_DEFAULT_LOCALE } from "@/lib/content/metadata";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/content/site";

// TASK-SEO-023: the document head emitted en + vi + x-default while the sitemap
// emitted only en + vi. Two hreflang declarations of the same route set that
// disagree are worse than one: Google discards an annotation it cannot
// reconcile. These tests pin the two surfaces to a single shared helper.

describe("seo/sitemap-hreflang-complete (TASK-SEO-023 §1.1)", () => {
  it("carries en, vi and x-default on every sitemap entry", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      const languages = entry.alternates?.languages;
      expect(languages, `no alternates on ${entry.url}`).toBeDefined();
      expect(Object.keys(languages!).sort()).toEqual(["en", "vi", "x-default"]);
    }
  });
});

describe("seo/sitemap-x-default-target (TASK-SEO-023 §1.2)", () => {
  it("points x-default at the en href for the same route", () => {
    for (const entry of sitemap()) {
      const languages = entry.alternates!.languages as Record<string, string>;
      expect(languages["x-default"]).toBe(languages.en);
    }
  });

  it("resolves x-default to the default locale, not the newest one", () => {
    expect(X_DEFAULT_LOCALE).toBe("en");
    expect(hreflangAlternates("/")["x-default"]).toBe(`${siteUrl}/en`);
  });
});

describe("seo/hreflang-head-sitemap-parity (TASK-SEO-023 §1.3)", () => {
  it("emits byte-identical alternates in the head and the sitemap for every route", () => {
    const entries = sitemap();

    for (const meta of routeMetadata) {
      const suffix = meta.route === "/" ? "" : meta.route;
      const head = resolveMetadata("en", meta.route).alternates.languages;
      const entry = entries.find((e) => e.url === `${siteUrl}/en${suffix}`);

      expect(entry, `no sitemap entry for ${meta.route}`).toBeDefined();
      expect(entry!.alternates!.languages).toEqual(head);
    }
  });

  it("agrees for the vi head as well, since alternates are locale-independent", () => {
    for (const meta of routeMetadata) {
      expect(resolveMetadata("vi", meta.route).alternates.languages).toEqual(
        resolveMetadata("en", meta.route).alternates.languages,
      );
    }
  });
});

describe("seo/hreflang-helper-total (TASK-SEO-023 §1.4)", () => {
  it("returns a three-key map for every registry route", () => {
    for (const meta of routeMetadata) {
      const map = hreflangAlternates(meta.route);
      expect(Object.keys(map).sort()).toEqual(["en", "vi", "x-default"]);
      for (const href of Object.values(map)) {
        expect(href.startsWith(`${siteUrl}/`)).toBe(true);
      }
    }
  });

  it("rejects a route outside the registry instead of emitting a half-built map", () => {
    expect(() => hreflangAlternates("/does-not-exist")).toThrow(/route registry/);
  });

  it("still gives a routable non-registry page a complete head alternate set (§3)", () => {
    // /lite is a live route deliberately kept out of the sitemap registry.
    // resolveMetadata must keep degrading for it: the strict helper guards the
    // sitemap, it must never make a real page fail to render.
    const languages = resolveMetadata("en", "/lite").alternates.languages;

    expect(Object.keys(languages).sort()).toEqual(["en", "vi", "x-default"]);
    expect(languages.en).toBe(`${siteUrl}/en/lite`);
    expect(languages["x-default"]).toBe(languages.en);
  });

  it("builds the root as /en with no trailing slash (§3 edge case)", () => {
    const map = hreflangAlternates("/");
    expect(map.en).toBe(`${siteUrl}/en`);
    expect(map.vi).toBe(`${siteUrl}/vi`);
    expect(map.en.endsWith("/")).toBe(false);
  });
});
