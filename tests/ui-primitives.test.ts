// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";

// TASK-DS-003: the in-repo primitives emit token-styled markup, keep native
// semantics, and pass axe with no external component dependency.
const RULES_OFF = {
  region: { enabled: false },
  "landmark-one-main": { enabled: false },
  "page-has-heading-one": { enabled: false },
  "document-title": { enabled: false },
  "html-has-lang": { enabled: false },
  bypass: { enabled: false },
  "color-contrast": { enabled: false },
} as const;

describe("DS-003 component primitives", () => {
  it("Button renders the token button markup", () => {
    const html = renderToStaticMarkup(createElement(Button, { variant: "primary" }, "Go"));
    expect(html).toContain('class="cs-btn cs-btn-primary"');
    expect(html).toContain('type="button"');
  });

  it("Card renders a named Liquid Glass material", () => {
    expect(renderToStaticMarkup(createElement(Card, { material: "heavy" }, "x"))).toContain('class="cs-surface-heavy"');
    expect(renderToStaticMarkup(createElement(Card, {}, "x"))).toContain('class="cs-glass-card"');
  });

  it("Field links the label to the input and wires the error", () => {
    const html = renderToStaticMarkup(
      createElement(Field, { label: "Email", error: "Required", name: "email" }),
    );
    expect(html).toMatch(/<label for="[^"]+"/);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
  });

  it("Dialog renders a labelled modal dialog when open", () => {
    const html = renderToStaticMarkup(
      createElement(Dialog, { open: true, onClose: () => {}, label: "Confirm", children: "body" }),
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Confirm"');
  });

  it("renders no serious/critical axe violations across the primitives", async () => {
    const html = renderToStaticMarkup(
      createElement(
        "main",
        null,
        createElement(Button, { variant: "primary" }, "Submit"),
        createElement(Card, { material: "standard" }, "card body"),
        createElement(Field, { label: "Your name", name: "name" }),
        createElement(Select, { label: "Intent", name: "intent" }, createElement("option", { value: "a" }, "A")),
      ),
    );
    document.body.innerHTML = html;
    const results = await axe.run(document.body, { rules: RULES_OFF });
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
