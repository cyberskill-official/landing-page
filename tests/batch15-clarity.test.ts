// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { ConsentGate } from "@/lib/analytics/consent";
import { LeadForm } from "@/components/cta/LeadForm";
import { NewsletterForm } from "@/components/cta/NewsletterForm";
import { GenieChatPanel } from "@/components/genie/GenieChatPanel";
import { useGenieStore } from "@/lib/genie/store";

describe("FR-OPS-012: Microsoft Clarity Session Replay", () => {
  const originalEnv = process.env;
  let container: HTMLDivElement;

  beforeEach(() => {
    Element.prototype.scrollTo = vi.fn();
    process.env = { ...originalEnv, NODE_ENV: "test" };
    ConsentGate._reset();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    process.env = originalEnv;
    ConsentGate._reset();
    container.remove();
    vi.restoreAllMocks();
  });

  it("analytics/clarity-env-gate: does not load Clarity when NEXT_PUBLIC_CLARITY_ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_CLARITY_ID;
    ConsentGate._upgrade({ "session-replay": true });

    const appendSpy = vi.spyOn(document.head, "appendChild").mockImplementation((node) => node);

    const root = createRoot(container);
    root.render(createElement(AnalyticsScripts, { nonce: "test-nonce" }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Simulate load event to bypass observer
    window.dispatchEvent(new Event("load"));
    // Trigger scroll interaction
    window.dispatchEvent(new Event("scroll"));

    expect(appendSpy).not.toHaveBeenCalled();
  });

  it("analytics/clarity-env-gate: does not load Clarity when consent is denied", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "mock-clarity-id";
    ConsentGate._upgrade({ "session-replay": false });

    const appendSpy = vi.spyOn(document.head, "appendChild").mockImplementation((node) => node);

    const root = createRoot(container);
    root.render(createElement(AnalyticsScripts, { nonce: "test-nonce" }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    window.dispatchEvent(new Event("load"));
    window.dispatchEvent(new Event("scroll"));

    // Verify no script tag with Clarity config was appended
    const hasClarity = appendSpy.mock.calls.some(([node]) => {
      return (node as HTMLScriptElement).innerHTML?.includes("clarity");
    });
    expect(hasClarity).toBe(false);
  });

  it("analytics/clarity-env-gate: loads Clarity in cookieless mode when env and consent are set", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "mock-clarity-id";
    ConsentGate._upgrade({ "session-replay": true });

    const appendSpy = vi.spyOn(document.head, "appendChild").mockImplementation((node) => node);

    const root = createRoot(container);
    root.render(createElement(AnalyticsScripts, { nonce: "test-nonce" }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    window.dispatchEvent(new Event("load"));
    window.dispatchEvent(new Event("scroll"));

    // Find the Clarity script element
    const clarityScriptCall = appendSpy.mock.calls.find(([node]) => {
      return (node as HTMLScriptElement).innerHTML?.includes("clarity");
    });

    expect(clarityScriptCall).toBeDefined();
    const scriptEl = clarityScriptCall?.[0] as HTMLScriptElement;
    expect(scriptEl.getAttribute("nonce")).toBe("test-nonce");
    expect(scriptEl.innerHTML).toContain("mock-clarity-id");
    
    // Cookieless enforcement verification
    expect(scriptEl.innerHTML).toContain('window.clarity("consent", false);');
  });

  it("analytics/clarity-masking: form and chat markup carry masking properties", async () => {
    const root = createRoot(container);
    
    // 1. LeadForm
    const leadFormDict = {
      form: {
        name: "Name",
        email: "Email",
        company: "Company",
        optional: "Optional",
        intent: "Intent",
        intentSelection: "Selection",
        message: "Message",
        consent: "Consent",
        submit: "Submit",
        sending: "Sending...",
        successTitle: "Success",
        successBody: "Body",
        errorTitle: "Error",
        errorBody: "Body",
        required: "Required",
        invalidEmail: "Invalid",
        consentRequired: "Consent required"
      },
      footer: {
        privacy: "Privacy"
      },
      genie: {
        contactFormFallback: "Fallback"
      }
    };
    root.render(createElement(LeadForm, { locale: "en", dict: leadFormDict as any, source: "contact" }));
    
    // Give time to render
    await new Promise((resolve) => setTimeout(resolve, 50));
    const formEl = container.querySelector("form");
    expect(formEl).not.toBeNull();
    expect(formEl?.classList.contains("clarity-mask")).toBe(true);
    expect(formEl?.getAttribute("data-clarity-mask")).toBe("true");

    // 2. NewsletterForm
    root.render(createElement(NewsletterForm, { locale: "en" }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Find the newsletter form (can query by class name since LeadForm is replaced)
    const newsletterFormEl = container.querySelector(".cs-newsletter-form");
    expect(newsletterFormEl).not.toBeNull();
    expect(newsletterFormEl?.classList.contains("clarity-mask")).toBe(true);
    expect(newsletterFormEl?.getAttribute("data-clarity-mask")).toBe("true");

    // 3. GenieChatPanel
    const chatDict = {
      genie: {
        title: "Lumi Chat",
        close: "Close",
        greeting: "Hello",
        wishCta: "Wish",
        wishAgree: "Agree",
        wishSkip: "Skip",
        thinking: "Thinking...",
        unavailable: "Unavailable"
      },
      footer: {
        privacy: "Privacy"
      }
    };
    useGenieStore.getState().setOpen(true);
    root.render(createElement(GenieChatPanel, { locale: "en", dict: chatDict as any }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    const chatContainer = container.querySelector("section");
    expect(chatContainer).not.toBeNull();
    expect(chatContainer?.classList.contains("clarity-mask")).toBe(true);
    expect(chatContainer?.getAttribute("data-clarity-mask")).toBe("true");
  });
});
