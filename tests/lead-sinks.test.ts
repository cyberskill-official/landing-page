import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/lead/route";
import { NextResponse } from "next/server";
import * as fs from "node:fs/promises";

vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  appendFile: vi.fn(),
}));

const base = {
  name: "Anh",
  email: "anh@example.com",
  intent: "project",
  consent: true,
  locale: "en",
};

describe("Lead Pipeline API", () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "production" };
    console.error = vi.fn();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("lead/sink-accounting: skipped unconfigured sink is not a failure", async () => {
    // Only file sink is configured (always true)
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_SLACK_WEBHOOK_URL;
    delete process.env.LEAD_CRM_WEBHOOK_URL;
    
    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });
    
    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    // Since file sink succeeds, configured = 1, failed = 0.
    // Ensure no error logged for pipeline failure
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining("pipeline failure"));
  });

  it("lead/total-failure-alert: all non-ack sinks fail without api key, returns ok:true", async () => {
    // With no RESEND_API_KEY, the ack sink is not configured.
    delete process.env.RESEND_API_KEY;

    // Mock fetch to reject
    global.fetch = vi.fn(() => Promise.reject(new Error("network error")));
    // Mock file sink to reject
    vi.spyOn(fs, "appendFile").mockRejectedValue(new Error("disk full"));

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200); // User still gets success

    // With file rejecting and no other configured sinks (no env vars set),
    // pipeline failure is logged.
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("pipeline failure"),
      expect.any(Object)
    );
  });

  it("lead/total-failure-alert: zero configured sinks in production triggers alert", async () => {
    // Remove all config
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_SLACK_WEBHOOK_URL;
    delete process.env.LEAD_CRM_WEBHOOK_URL;
    // Mock file sink to fail so configured sinks = 0
    vi.spyOn(fs, "appendFile").mockRejectedValue(new Error("disk full"));

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });
    
    const res = await POST(req);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("pipeline failure"),
      expect.any(Object)
    );
  });

  it("lead/synthetic-path: synthetic lead skips CRM forward", async () => {
    process.env.LEAD_CRM_WEBHOOK_URL = "https://crm.cyberskill.world";
    
    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify({ ...base, source: "synthetic" }),
    });
    
    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    
    expect(global.fetch).not.toHaveBeenCalledWith("https://crm.cyberskill.world", expect.any(Object));
  });
});
