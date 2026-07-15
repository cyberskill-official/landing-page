// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { LeadForm } from "@/components/cta/LeadForm";
import { getDictionary } from "@/lib/i18n/dictionaries";
// @ts-ignore
import { JSDOM } from "jsdom";
import { POST as leadPost } from "@/app/api/lead/route";
import * as fs from "node:fs/promises";

vi.mock("node:fs/promises", () => {
  const mkdir = vi.fn();
  const appendFile = vi.fn();
  return {
    mkdir,
    appendFile,
    default: {
      mkdir,
      appendFile,
    },
  };
});

describe("TASK-CTA-013: Form Validation & Honeypot A11y", () => {
  const dict = getDictionary("en");

  it("cta/form-required-attrs: required fields carry required and aria-required (TASK-CTA-013 §1.1)", () => {
    const html = renderToStaticMarkup(
      createElement(LeadForm, { locale: "en", dict })
    );
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const name = doc.querySelector("#name");
    expect(name).toBeDefined();
    expect(name?.getAttribute("required")).toBe("");
    expect(name?.getAttribute("aria-required")).toBe("true");

    const email = doc.querySelector("#email");
    expect(email).toBeDefined();
    expect(email?.getAttribute("required")).toBe("");
    expect(email?.getAttribute("aria-required")).toBe("true");

    const consent = doc.querySelector("#consent");
    expect(consent).toBeDefined();
    expect(consent?.getAttribute("required")).toBe("");
    expect(consent?.getAttribute("aria-required")).toBe("true");
  });

  it("checks honeypot is hidden from assistive tech (TASK-CTA-013 §1.3)", () => {
    const html = renderToStaticMarkup(
      createElement(LeadForm, { locale: "en", dict })
    );
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const honeypotContainer = doc.querySelector(".cs-visually-hidden");
    expect(honeypotContainer?.getAttribute("aria-hidden")).toBe("true");

    const honeypotInput = doc.querySelector("#website");
    expect(honeypotInput?.getAttribute("aria-hidden")).toBe("true");
    expect(honeypotInput?.getAttribute("tabindex")).toBe("-1");
  });

  it("api/lead-validation: rejects payload missing email with 400 and validation_error (TASK-CTA-013 §1.2)", async () => {
    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Anh",
        intent: "project",
        consent: true,
        locale: "en",
      }),
    });

    const res = await leadPost(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("validation_error");
    expect(data.issues.email).toBeDefined();
  });

  it("api/lead-honeypot: honeypot-filled payload is discarded and reaches no sinks (TASK-CTA-013 §1.4)", async () => {
    // Set up environment to mock a working pipeline
    const originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: "production", RESEND_API_KEY: "test-key" };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response));

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify({
        name: "Anh",
        email: "anh@example.com",
        intent: "project",
        consent: true,
        locale: "en",
        website: "http://bot-submission.com", // honeypot filled
      }),
    });

    const res = await leadPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // Assert fetch was not called (meaning neither CRM webhook nor Resend was triggered)
    expect(global.fetch).not.toHaveBeenCalled();
    // Assert appendFile (file sink) was not called
    expect(fs.appendFile).not.toHaveBeenCalled();

    process.env = originalEnv;
  });
});
