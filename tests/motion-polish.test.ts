// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { clamp, digestEase, magneticOffset, splitSloganWords, tiltFromPointer } from "@/lib/motion/kinetic";
import { KineticText } from "@/components/motion/KineticText";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { IntroVeil } from "@/components/motion/IntroVeil";

// Premium motion polish (FR-DS-012): the math helpers are pure, so their edge
// cases pin down here; the markup tests guarantee the kinetic headline never
// costs the H1 its accessible name and that the decorative surfaces stay
// hidden from assistive tech in both locales.

describe("motion math helpers (FR-DS-012)", () => {
  it("splits slogans into words across locales, diacritics intact", () => {
    expect(splitSloganWords(company.slogan.en)).toEqual(["Turn", "Your", "Will", "Into", "Real"]);
    // Brand-exact VN casing per DESIGN.md (title case).
    expect(splitSloganWords(company.slogan.vi)).toEqual(["Hiện", "Thực", "Hoá", "Ý", "Chí"]);
    expect(splitSloganWords("  a   b\n c ")).toEqual(["a", "b", "c"]);
    expect(splitSloganWords("")).toEqual([]);
  });

  it("clamps values to the given range", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });

  it("digestEase devours near blocks first and everything by p=1 (FR-CHAR-032)", () => {
    expect(digestEase(0, 0)).toBe(0);
    expect(digestEase(0, 1)).toBe(0);
    expect(digestEase(1, 0)).toBe(1);
    expect(digestEase(1, 1)).toBe(1);
    // At mid-progress the nearest block is further along than the farthest.
    expect(digestEase(0.5, 0)).toBeGreaterThan(digestEase(0.5, 1));
    // Monotonic in p for a fixed distance.
    let prev = 0;
    for (let p = 0; p <= 1.001; p += 0.1) {
      const e = digestEase(p, 0.6);
      expect(e).toBeGreaterThanOrEqual(prev);
      prev = e;
    }
  });

  it("KineticText renders per-word masks with the accessible text intact", () => {
    const html = renderToStaticMarkup(createElement("h2", { "aria-label": "How we work" }, createElement(KineticText, { text: "How we work" })));
    expect(html.match(/cs-kt-word/g)?.length).toBe(3);
    expect(html).toContain(">work</span>");
    expect(html).toContain('aria-label="How we work"');
  });

  it("caps the magnetic pull and survives degenerate sizes", () => {
    const capped = magneticOffset(1000, -1000, 120, 0.28, 8);
    expect(capped.x).toBe(8);
    expect(capped.y).toBe(-8);
    expect(magneticOffset(10, 5, 0, 0.28, 8)).toEqual({ x: 0, y: 0 });
    const soft = magneticOffset(30, 0, 120, 0.25, 8); // (30/120) * 120 * 0.25
    expect(soft.x).toBeCloseTo(7.5);
    expect(soft.y).toBe(0);
  });

  it("tilts toward the pointer, zero at centre, capped at the edges", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 };
    expect(tiltFromPointer(100, 50, rect, 4)).toEqual({ rx: 0, ry: 0 });
    const topRight = tiltFromPointer(200, 0, rect, 4);
    expect(topRight.rx).toBeCloseTo(4);
    expect(topRight.ry).toBeCloseTo(4);
    const farOutside = tiltFromPointer(-999, 999, rect, 4);
    expect(farOutside.rx).toBeCloseTo(-4);
    expect(farOutside.ry).toBeCloseTo(-4);
    expect(tiltFromPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 }, 4)).toEqual({ rx: 0, ry: 0 });
  });
});

describe("kinetic hero markup stays accessible (FR-DS-012)", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`keeps the full ${locale} slogan as the H1 accessible name with per-word masks`, () => {
      const html = renderToStaticMarkup(createElement(Hero, { locale, dict: getDictionary(locale) }));
      expect(html).toContain(`aria-label="${company.slogan[locale]}"`);
      const words = splitSloganWords(company.slogan[locale]);
      expect(html.match(/cs-kinetic-word/g)?.length).toBe(words.length);
      for (const word of words) expect(html).toContain(`>${word}</span>`);
      // The hero carries its aurora backdrop, behind the z-raised inner content.
      expect(html).toContain("cs-aurora");
    });
  }
});

describe("decorative motion surfaces are hidden from assistive tech (FR-DS-012)", () => {
  it("marquee is aria-hidden and doubled for the seamless -50% loop", () => {
    const dict = getDictionary("en");
    const html = renderToStaticMarkup(createElement(Marquee, { dict }));
    expect(html).toContain('class="cs-marquee cs-no-print" aria-hidden="true"');
    const items = html.match(/cs-marquee-item/g) ?? [];
    expect(items.length).toBe(dict.marquee.items.length * 2);
  });

  it("intro veil is aria-hidden and carries the localized slogan", () => {
    for (const locale of ["en", "vi"] as const) {
      const html = renderToStaticMarkup(createElement(IntroVeil, { locale }));
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain(company.slogan[locale]);
    }
  });
});
