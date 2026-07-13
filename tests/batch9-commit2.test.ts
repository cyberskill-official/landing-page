// @vitest-environment jsdom
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { ConsentGate } from "@/lib/analytics/consent";

describe("Batch 9 Commit 2 tests — FR-PERF-009 (Consent-gated Analytics)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Reset consent gate state before each test
    (ConsentGate as any)._reset();
    
    // Clean up document head script tags
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
    // Ensure consent is denied
    expect(ConsentGate.canLoad("analytics")).toBe(false);

    // Mount AnalyticsScripts using React Root
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(AnalyticsScripts, { nonce: "test-nonce" }));
    });

    // Trigger load and scroll events
    await act(async () => {
      window.dispatchEvent(new Event("load"));
      window.dispatchEvent(new Event("scroll"));
    });

    const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
    expect(gaScript).toBeNull();
  });

  test("analytics/consent-gate: should load GA scripts when consent is granted", async () => {
    // Grant consent
    (ConsentGate as any)._upgrade({ analytics: true });
    expect(ConsentGate.canLoad("analytics")).toBe(true);

    // Mount AnalyticsScripts
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(AnalyticsScripts, { nonce: "test-nonce" }));
    });

    // Trigger load and scroll events
    await act(async () => {
      window.dispatchEvent(new Event("load"));
      window.dispatchEvent(new Event("scroll"));
    });

    const gaScript = document.querySelector('script[src*="googletagmanager.com"]');
    expect(gaScript).not.toBeNull();
    expect(gaScript?.getAttribute("nonce")).toBe("test-nonce");

    const inlineScript = Array.from(document.querySelectorAll("script")).find(
      (el) => el.innerHTML.includes("window.dataLayer = window.dataLayer")
    );
    expect(inlineScript).toBeDefined();
    expect(inlineScript?.getAttribute("nonce")).toBe("test-nonce");
  });
});
