// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  ConsentGate,
} from "@/lib/analytics/consent";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { getDictionary } from "@/lib/i18n/dictionaries";

// @ts-expect-error react act flag for createRoot
global.IS_REACT_ACT_ENVIRONMENT = true;

describe("Consent banner + session-replay gate", () => {
  const originalEnv = process.env;
  let container: HTMLDivElement;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "test" };
    ConsentGate._reset(true);
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.stubGlobal(
      "requestIdleCallback",
      (cb: IdleRequestCallback) => {
        cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
        return 1;
      },
    );
    vi.stubGlobal("cancelIdleCallback", () => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    ConsentGate._reset(true);
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("analytics/consent-banner: does not render when NEXT_PUBLIC_CLARITY_ID is missing", async () => {
    delete process.env.NEXT_PUBLIC_CLARITY_ID;
    const dict = getDictionary("en");
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ConsentBanner, { locale: "en", dict }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.querySelector(".cs-consent-banner")).toBeNull();
  });

  it("analytics/consent-banner: Accept enables session-replay and persists choice", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "xngfe1jaip";
    const dict = getDictionary("en");
    const changeSpy = vi.fn();
    window.addEventListener(CONSENT_CHANGE_EVENT, changeSpy);

    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ConsentBanner, { locale: "en", dict }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const banner = container.querySelector(".cs-consent-banner");
    expect(banner).not.toBeNull();
    expect(ConsentGate.canLoad("session-replay")).toBe(false);

    const accept = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(dict.consentBanner.accept),
    );
    expect(accept).toBeDefined();
    await act(async () => {
      accept!.click();
    });

    expect(ConsentGate.canLoad("session-replay")).toBe(true);
    expect(ConsentGate.hasDecision()).toBe(true);
    expect(changeSpy).toHaveBeenCalled();
    expect(container.querySelector(".cs-consent-banner")).toBeNull();

    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "{}");
    expect(stored.version).toBe(1);
    expect(stored.choices["session-replay"]).toBe(true);

    window.removeEventListener(CONSENT_CHANGE_EVENT, changeSpy);
  });

  it("analytics/consent-banner: Decline keeps session-replay denied and hides banner", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "xngfe1jaip";
    const dict = getDictionary("en");
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ConsentBanner, { locale: "en", dict }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const decline = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(dict.consentBanner.decline),
    );
    await act(async () => {
      decline!.click();
    });

    expect(ConsentGate.canLoad("session-replay")).toBe(false);
    expect(ConsentGate.hasDecision()).toBe(true);
    expect(container.querySelector(".cs-consent-banner")).toBeNull();

    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "{}");
    expect(stored.choices["session-replay"]).toBe(false);
  });

  it("analytics/consent-banner: hydrate restores Accept so banner stays hidden", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "xngfe1jaip";
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        decidedAt: new Date().toISOString(),
        choices: { "session-replay": true },
      }),
    );

    const dict = getDictionary("en");
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(ConsentBanner, { locale: "en", dict }));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(ConsentGate.canLoad("session-replay")).toBe(true);
    expect(container.querySelector(".cs-consent-banner")).toBeNull();
  });

  it("analytics/consent-banner: Accept after mount loads Clarity via change event", async () => {
    process.env.NEXT_PUBLIC_CLARITY_ID = "xngfe1jaip";
    ConsentGate._reset(true);

    const appendSpy = vi
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => node);

    const dict = getDictionary("en");
    const root = createRoot(container);
    await act(async () => {
      root.render(
        createElement(
          "div",
          null,
          createElement(AnalyticsScripts),
          createElement(ConsentBanner, { locale: "en", dict }),
        ),
      );
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    // Pre-accept: no Clarity
    const pre = appendSpy.mock.calls.some(([node]) => {
      const el = node as HTMLScriptElement;
      return el.src?.includes("clarity.ms");
    });
    expect(pre).toBe(false);

    const accept = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(dict.consentBanner.accept),
    );
    await act(async () => {
      accept!.click();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    const clarityScript = appendSpy.mock.calls.find(([node]) => {
      const el = node as HTMLScriptElement;
      return el.src?.includes("clarity.ms/tag/xngfe1jaip");
    });
    expect(clarityScript).toBeDefined();
  });
});
