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
    // FORCE_ENV_CHECK: getRequiredEnv skips production checks under Vitest unless set
    // (see lib/ops/env.ts) — required for lead/resend-required fail-closed.
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      FORCE_ENV_CHECK: "true",
    };
    console.error = vi.fn();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("lead/resend-only: production succeeds without LEAD_CRM_WEBHOOK_URL", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.LEAD_SLACK_WEBHOOK_URL;
    delete process.env.LEAD_CRM_WEBHOOK_URL;
    delete process.env.LEAD_CRM_TOKEN;

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.error).not.toBe("configuration_error");
    // Must not demand CyberOS in Resend-only production
    expect(JSON.stringify(data)).not.toContain("LEAD_CRM_WEBHOOK_URL");
  });

  it("lead/crm-optional: unconfigured CRM is skipped, not a hard failure", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.LEAD_CRM_WEBHOOK_URL;

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    // CRM URL never called when unset
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    const crmCalls = fetchMock.mock.calls.filter(
      (c) => typeof c[0] === "string" && String(c[0]).includes("crm"),
    );
    expect(crmCalls.length).toBe(0);
  });

  it("lead/resend-required: production fails closed without RESEND_API_KEY", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_CRM_WEBHOOK_URL;

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("configuration_error");
    expect(data.message).toContain("MISSING_PRODUCTION_KEY_RESEND_API_KEY");
    expect(data.message).not.toContain("LEAD_CRM");
  });

  it("lead/total-failure-alert: when Resend present but sinks fail, still ok:true", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.LEAD_CRM_WEBHOOK_URL;
    global.fetch = vi.fn(() => Promise.reject(new Error("network error")));
    vi.spyOn(fs, "appendFile").mockRejectedValue(new Error("disk full"));

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("pipeline failure"),
      expect.any(Object),
    );
  });

  it("lead/crm-when-set: forwards to CyberOS webhook as best-effort", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.LEAD_CRM_WEBHOOK_URL = "https://crm.cyberskill.world/leads";
    process.env.LEAD_CRM_TOKEN = "tok";

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify(base),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://crm.cyberskill.world/leads",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer tok",
        }),
      }),
    );
  });

  it("lead/synthetic-path: synthetic lead skips CRM forward", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.LEAD_CRM_WEBHOOK_URL = "https://crm.cyberskill.world";

    const req = new Request("https://cyberskill.world/api/lead", {
      method: "POST",
      body: JSON.stringify({ ...base, source: "synthetic" }),
    });

    const res = await POST(req);
    expect((res as NextResponse).status).toBe(200);

    expect(global.fetch).not.toHaveBeenCalledWith(
      "https://crm.cyberskill.world",
      expect.any(Object),
    );
  });
});
