// @vitest-environment jsdom
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { ConsentGate } from "@/lib/analytics/consent";

function installMemoryLocalStorage(): Record<string, string> {
  const memoryStore: Record<string, string> = {};
  const api: Storage = {
    getItem: (key: string) => memoryStore[key] ?? null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      for (const key of Object.keys(memoryStore)) delete memoryStore[key];
    },
    key: () => null,
    get length() {
      return Object.keys(memoryStore).length;
    },
  };
  Object.defineProperty(window, "localStorage", {
    value: api,
    configurable: true,
    writable: true,
  });
  return memoryStore;
}

describe("Batch 9 Commit 2 tests — TASK-PERF-009 (Consent Mode Analytics)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    installMemoryLocalStorage();
    (ConsentGate as any)._reset(true);

    document.querySelectorAll("script").forEach((el) => {
      if (el.src.includes("googletagmanager") || el.innerHTML.includes("gtag")) {
        el.remove();
      }
    });
    delete window.gtag;
    delete window.dataLayer;

    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    (ConsentGate as any)._reset(true);
    container?.remove();
  });

  test("analytics/consent-gate: loads gtag with Consent Mode denied when analytics not granted", async () => {
    expect(ConsentGate.canLoad("analytics")).toBe(false);

    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(AnalyticsScripts));
    });

    await act(async () => {
      window.dispatchEvent(new Event("load"));
      window.dispatchEvent(new Event("scroll"));
    });

    const gaScript = document.querySelector(
      'script[src*="googletagmanager.com"]',
    ) as HTMLScriptElement | null;
    expect(gaScript).not.toBeNull();
    expect(gaScript?.src).toContain("G-HBXWFJNMHD");
    expect(typeof window.gtag).toBe("function");

    const consentDefault = (window.dataLayer as unknown[] | undefined)?.find(
      (row) => Array.isArray(row) && row[0] === "consent" && row[1] === "default",
    ) as unknown[] | undefined;
    expect(consentDefault).toBeDefined();
    expect(consentDefault?.[2]).toMatchObject({ analytics_storage: "denied" });
  });

  test("analytics/consent-gate: upgrades analytics_storage when consent is granted", async () => {
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

    const gaScript = document.querySelector(
      'script[src*="googletagmanager.com"]',
    ) as HTMLScriptElement | null;
    expect(gaScript).not.toBeNull();
    expect(gaScript?.getAttribute("nonce")).toBeNull();
    expect(gaScript?.async).toBe(true);

    const inlineScript = Array.from(document.querySelectorAll("script")).find((el) =>
      el.innerHTML.includes("window.dataLayer = window.dataLayer"),
    );
    expect(inlineScript).toBeUndefined();

    expect(typeof window.gtag).toBe("function");
    expect(Array.isArray(window.dataLayer)).toBe(true);

    const consentUpdate = (window.dataLayer as unknown[] | undefined)?.find(
      (row) =>
        Array.isArray(row) &&
        row[0] === "consent" &&
        row[1] === "update" &&
        (row[2] as { analytics_storage?: string })?.analytics_storage === "granted",
    );
    expect(consentUpdate).toBeDefined();
  });
});
