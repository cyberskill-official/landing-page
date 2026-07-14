import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "../proxy";
import { POST as cspReportPost } from "../app/api/csp-report/route";

describe("FR-OPS-015: Content-Security-Policy (CSP) dynamic headers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("security/csp-enforced: production response headers include Content-Security-Policy with strict directives", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VITEST_FORCE_PROD = "undefined"; // clear test helper if any
    
    const req = new NextRequest("https://cyberskill.world/en");
    const res = middleware(req);

    // Should have Content-Security-Policy and NOT Content-Security-Policy-Report-Only
    expect(res.headers.has("Content-Security-Policy")).toBe(true);
    expect(res.headers.has("Content-Security-Policy-Report-Only")).toBe(false);

    const csp = res.headers.get("Content-Security-Policy") || "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    // style-src carries 'unsafe-inline' in production too (not just
    // report-only): nonces do not cover style ATTRIBUTES in Chrome, only
    // <style>/<link> tags, and the app sets per-frame inline styles from JS
    // (LumiHotspot.tsx's el.style.transform, etc.) whose values can't be
    // hashed. Confirmed live: without this, every JS-driven inline style was
    // silently blocked in production. script-src stays nonce-only and strict.
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    // Verify script-src still carries its nonce
    expect(csp).toContain("'nonce-");
  });

  it("security/csp-report-only: non-production headers carry Content-Security-Policy-Report-Only instead", () => {
    process.env.VERCEL_ENV = "preview";
    
    const req = new NextRequest("https://cyberskill.world/en");
    const res = middleware(req);

    // Should have Content-Security-Policy-Report-Only and NOT Content-Security-Policy
    expect(res.headers.has("Content-Security-Policy-Report-Only")).toBe(true);
    expect(res.headers.has("Content-Security-Policy")).toBe(false);

    const csp = res.headers.get("Content-Security-Policy-Report-Only") || "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("security/csp-logging: POST to /api/csp-report successfully logs violation payloads", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const mockPayload = {
      "csp-report": {
        "document-uri": "https://cyberskill.world/en",
        "referrer": "",
        "blocked-uri": "http://evil.com/malicious.js",
        "violated-directive": "script-src-elem",
        "original-policy": "default-src 'self' ...",
      }
    };

    const req = new Request("https://cyberskill.world/api/csp-report", {
      method: "POST",
      body: JSON.stringify(mockPayload),
    });

    const res = await cspReportPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // Verify console warning was called with the violation prefix and payload
    expect(consoleWarnSpy).toHaveBeenCalled();
    const loggedArgs = consoleWarnSpy.mock.calls[0];
    expect(loggedArgs[0]).toBe("[csp-violation]");
    expect(loggedArgs[1]).toContain("evil.com");
  });

  it("security/csp-whitelist: directives only allow connections and sources to whitelisted resources", () => {
    // Check both production and staging to verify whitelist contents
    process.env.VERCEL_ENV = "production";
    
    const req = new NextRequest("https://cyberskill.world/en");
    const res = middleware(req);
    const csp = res.headers.get("Content-Security-Policy") || "";

    // Verify Google Analytics/GTM is whitelisted in script, connect, img
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com");
    // blob: (glTF texture decode) and 'wasm-unsafe-eval' (glTF mesh
    // decompression) are required by the Lumi mascot's Three.js scene -
    // regression guard for the CSP gap that made her render white / not
    // render at all once this header went from report-only to enforcing.
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("'wasm-unsafe-eval'");
    // Three.js loads the same glTF blob: texture via fetch() on this path,
    // which connect-src governs, not img-src - both are needed.
    expect(csp).toContain("connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com");
    // Vercel Live Feedback/Toolbar script, confirmed loading in production.
    expect(csp).toContain("https://vercel.live");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("report-uri /api/csp-report");
  });
});
