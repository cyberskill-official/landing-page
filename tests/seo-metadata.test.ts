import { describe, it, expect } from "vitest";
import { pageMetadata } from "@/lib/seo/metadata";

describe("pageMetadata helper (FR-SEO-005, FR-SEO-009)", () => {
  it("sets a locale-correct canonical and a complete hreflang set", () => {
    const m = pageMetadata({ locale: "vi", path: "/work", title: "Du an" });
    expect(m.alternates?.canonical).toBe("/vi/work");
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs.en).toBe("/en/work");
    expect(langs.vi).toBe("/vi/work");
    expect(langs["x-default"]).toBe("/en/work");
  });

  it("handles the home path with no trailing segment", () => {
    const m = pageMetadata({ locale: "en", path: "", title: "Home" });
    expect(m.alternates?.canonical).toBe("/en");
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs["x-default"]).toBe("/en");
  });

  it("mirrors title into OpenGraph and Twitter and maps the OG locale", () => {
    const m = pageMetadata({ locale: "vi", path: "/privacy", title: "Quyen rieng tu", description: "x" });
    expect(m.openGraph?.title).toBe("Quyen rieng tu");
    expect((m.openGraph as { locale?: string }).locale).toBe("vi_VN");
    expect((m.twitter as { card?: string }).card).toBe("summary_large_image");
    expect(m.description).toBe("x");
  });
});
