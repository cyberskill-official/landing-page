// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DesignSystemButton } from "@/lib/design-system/button";

describe("DesignSystemButton (@cyberskill/design)", () => {
  it("renders package Button markup (.cs-button)", () => {
    const html = renderToStaticMarkup(
      createElement(DesignSystemButton, { variant: "primary" }, "Accept"),
    );
    expect(html).toContain("cs-button");
    expect(html).toContain("cs-button--primary");
    expect(html).toContain('type="button"');
    expect(html).toContain("Accept");
  });

  it("supports secondary variant used by the consent banner", () => {
    const html = renderToStaticMarkup(
      createElement(DesignSystemButton, { variant: "secondary" }, "Decline"),
    );
    expect(html).toContain("cs-button--secondary");
  });
});
