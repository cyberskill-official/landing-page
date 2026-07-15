import { expect, test, describe, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "../proxy";
import { displayFont } from "@/app/fonts";

describe("Commit 2 tests — TASK-PERF-005, TASK-PERF-012, TASK-OPS-009", () => {
  // --- TASK-PERF-005: Font Loading ---
  test("lint/font-single-source: displayFont configuration matches requirements", () => {
    expect(displayFont.variable).toBe("--font-display");
  });

  // --- TASK-OPS-009: CSP report-only header ---
  test("headers/csp-present: middleware sets Content-Security-Policy-Report-Only with nonce", () => {
    const req = new NextRequest("https://cyberskill.world/en");
    const res = middleware(req);
    
    const csp = res.headers.get("Content-Security-Policy-Report-Only");
    expect(csp).toBeTruthy();
    
    // Directives presence checks
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("nonce-");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    // connect-src carries blob: since the TASK-OPS-015 CSP fix (Lumi's glTF
    // texture loads via fetch() on a blob: URL) - see tests/csp-security.test.ts
    // for the full regression suite on this header.
    expect(csp).toContain("connect-src 'self' blob: https://*.google-analytics.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("report-uri /api/csp-report");

    // Nonce should also be injected in the request headers passed down
    const requestNonce = res.headers.get("x-middleware-request-x-nonce");
    expect(requestNonce).toBeTruthy();
    expect(csp).toContain(`nonce-${requestNonce}`);
  });

  test("headers/csp-present: rewrite route for root / also sets CSP header and nonce", () => {
    const req = new NextRequest("https://cyberskill.world/");
    const res = middleware(req);
    
    const csp = res.headers.get("Content-Security-Policy-Report-Only");
    expect(csp).toBeTruthy();
    
    const requestNonce = res.headers.get("x-middleware-request-x-nonce");
    expect(requestNonce).toBeTruthy();
    expect(csp).toContain(`nonce-${requestNonce}`);
  });
});
