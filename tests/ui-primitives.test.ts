// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { DesignSystemButton as Button } from "@/lib/design-system/button";
import { Card } from "@/lib/design-system/card";
import { TextField, Select } from "@/lib/design-system/forms";
import { Tag } from "@/lib/design-system/tag";
import { Icon } from "@/lib/design-system/icon";

// Phase 3: package primitives replace the in-repo Field/Select/Card/Dialog.
// Button coverage remains from Phase 2. All of them must pass axe.
const RULES_OFF = {
  region: { enabled: false },
  "landmark-one-main": { enabled: false },
  "page-has-heading-one": { enabled: false },
  "document-title": { enabled: false },
  "html-has-lang": { enabled: false },
  bypass: { enabled: false },
  "color-contrast": { enabled: false },
} as const;

describe("Phase 3 package primitives", () => {
  it("Button renders the design-system button markup", () => {
    const html = renderToStaticMarkup(createElement(Button, { variant: "primary" }, "Go"));
    expect(html).toContain("cs-button cs-button--primary");
    expect(html).toContain('type="button"');
  });

  it("Card renders the package panel (glass via surface class)", () => {
    const html = renderToStaticMarkup(
      createElement(Card, { className: "cs-surface-standard" }, "x"),
    );
    expect(html).toContain("cs-card");
    expect(html).toContain("cs-surface-standard");
  });

  it("TextField links the label to the input and wires the error", () => {
    const html = renderToStaticMarkup(
      createElement(TextField, { label: "Email", error: "Required", name: "email" }),
    );
    expect(html).toMatch(/class="[^"]*cs-field/);
    expect(html).toContain("cs-field__control");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
  });

  it("Select renders options in the package field frame", () => {
    const html = renderToStaticMarkup(
      createElement(Select, {
        label: "Intent",
        name: "intent",
        options: [{ value: "a", label: "A" }],
      }),
    );
    expect(html).toContain("cs-field");
    expect(html).toContain("cs-select");
    expect(html).toContain("<option");
  });

  it("Tag emits the package chip class", () => {
    const html = renderToStaticMarkup(createElement(Tag, null, "web-apps"));
    expect(html).toContain('class="cs-tag"');
    expect(html).toContain("web-apps");
  });

  it("Icon renders a named package glyph", () => {
    const html = renderToStaticMarkup(createElement(Icon, { name: "sparkle", size: "sm" }));
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders no serious/critical axe violations across the primitives", async () => {
    const html = renderToStaticMarkup(
      createElement(
        "main",
        null,
        createElement(Button, { variant: "primary" }, "Submit"),
        createElement(Card, { className: "cs-surface-standard" }, "card body"),
        createElement(TextField, { label: "Your name", name: "name" }),
        createElement(Select, {
          label: "Intent",
          name: "intent",
          options: [{ value: "a", label: "A" }],
        }),
        createElement(Tag, null, "mobile"),
        createElement(Icon, { name: "check", label: "Done" }),
      ),
    );
    document.body.innerHTML = html;
    const results = await axe.run(document.body, { rules: RULES_OFF });
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
