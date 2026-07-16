import { expect, test, describe } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "../proxy";
import { displayFont } from "@/app/fonts";

describe("Commit 2 tests — TASK-PERF-005, TASK-PERF-012, TASK-OPS-009", () => {
  // --- TASK-PERF-005: Font Loading ---
  test("lint/font-single-source: displayFont configuration matches requirements", () => {
    expect(displayFont.variable).toBe("--font-display");
  });

  // --- TASK-OPS-009: CSP report-only header (static-friendly, no nonce) ---
  test("headers/csp-present: middleware sets Content-Security-Policy-Report-Only with unsafe-inline for Next flight", () => {
    const req = new NextRequest("https://cyberskill.world/en");
    const res = middleware(req);

    const csp = res.headers.get("Content-Security-Policy-Report-Only");
    expect(csp).toBeTruthy();

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    // Static SSG: unsafe-inline for RSC flight scripts (hash/nonce would force dynamic or block hydration)
    expect(csp).toContain("'unsafe-inline'");
    expect(csp).not.toContain("nonce-");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("connect-src 'self' blob: https://*.google-analytics.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("report-uri /api/csp-report");

    expect(res.headers.get("x-middleware-request-x-nonce")).toBeNull();
  });

  test("headers/csp-present: rewrite route for root / also sets CSP header", () => {
    const req = new NextRequest("https://cyberskill.world/");
    const res = middleware(req);

    const csp = res.headers.get("Content-Security-Policy-Report-Only");
    expect(csp).toBeTruthy();
    expect(csp).toContain("'unsafe-inline'");
    expect(csp).not.toContain("nonce-");
    expect(res.headers.get("x-middleware-request-x-nonce")).toBeNull();
  });
});
