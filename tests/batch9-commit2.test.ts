// @vitest-environment jsdom
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { ConsentGate } from "@/lib/analytics/consent";

describe("Batch 9 Commit 2 tests — TASK-PERF-009 (Consent-gated Analytics)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    (ConsentGate as any)._reset();

    document.querySelectorAll("script").forEach((el) => {
      if (el.src.includes("googletagmanager") || el.innerHTML.includes("gtag")) {
        el.remove();
      }
    });

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    (ConsentGate as any)._reset();
    container.remove();
  });

  test("analytics/consent-gate: should NOT load GA scripts when consent is denied", async () => {
    expect(ConsentGate.canLoad("analytics")).toBe(false);

    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(AnalyticsScripts));
    });

    await act(async () => {
      window.dispatchEvent(new Event("load"));
      window.dispatchEvent(new Event("scroll"));
    });

    const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
    expect(gaScript).toBeNull();
  });

  test("analytics/consent-gate: should load GA scripts when consent is granted", async () => {
    (ConsentGate as any)._upgrade({ analytics: true });
    expect(ConsentGate.canLoad("analytics")).toBe(true);

    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(AnalyticsScripts));
    });

    await act(async () => {
      window.dispatchEvent(new Event("load"));
      window.dispatchEvent(new Event("scroll"));
    });

    // External gtag loader only — bootstrap runs in the module (hash CSP, no inline/nonce)
    const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
    expect(gaScript).not.toBeNull();
    expect(gaScript?.getAttribute("nonce")).toBeNull();
    expect(gaScript?.async).toBe(true);

    // No inline gtag bootstrap script tags
    const inlineScript = Array.from(document.querySelectorAll("script")).find((el) =>
      el.innerHTML.includes("window.dataLayer = window.dataLayer"),
    );
    expect(inlineScript).toBeUndefined();

    // Module bootstrapped gtag on window
    expect(typeof window.gtag).toBe("function");
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });
});
