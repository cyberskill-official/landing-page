import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Icon, type IconName } from "@/lib/design-system/icon";

describe("icon set (TASK-DS-010 → package Icon)", () => {
  const names: IconName[] = [
    "close",
    "sun",
    "moon",
    "arrow-right",
    "check",
    "sparkle",
    "chat",
    "sound-on",
    "sound-off",
  ];

  it("package Icon renders every Lumi name as an SVG", () => {
    for (const name of names) {
      const html = renderToStaticMarkup(createElement(Icon, { name, size: "md" }));
      expect(html, name).toContain("<svg");
      expect(html, name).toContain('viewBox="0 0 24 24"');
      expect(html, name).toContain("<path");
    }
  });

  it("re-exports from the package — no local glyph table", () => {
    const wrapper = readFileSync(
      resolve(import.meta.dirname, "../components/ui/Icon.tsx"),
      "utf8",
    );
    expect(wrapper).toMatch(/from "@\/lib\/design-system\/icon"/);
    expect(wrapper).not.toMatch(/lib\/icons/);
  });
});
