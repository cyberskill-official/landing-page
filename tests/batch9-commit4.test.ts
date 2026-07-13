// @vitest-environment jsdom
import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { POST } from "@/app/api/lead/route";
import { mapLeadToCrm, CRM_FIELD_MAPPING } from "@/lib/lead/crm-mapping";

describe("Batch 9 Commit 4 tests — FR-CTA-006 & FR-CHAR-027 (CRM Webhook & Slack Transcript)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.spyOn(global, "fetch");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // --- FR-CTA-006: CRM Webhook Field Mapping ---
  test("api/lead-crm-mapping: maps form input fields to CRM properties correctly", () => {
    const lead = {
      name: "John Doe",
      email: "john@example.com",
      company: "Acme Corporation",
      intent: "project" as const,
      message: "Build a Next.js web application",
      consent: true,
      locale: "en" as const,
      source: "hero",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "brand_search",
      utm_term: "cyberskill",
      utm_content: "header_logo",
    };

    const mapped = mapLeadToCrm(lead);

    expect(mapped[CRM_FIELD_MAPPING.name]).toBe("John Doe");
    expect(mapped[CRM_FIELD_MAPPING.email]).toBe("john@example.com");
    expect(mapped[CRM_FIELD_MAPPING.company]).toBe("Acme Corporation");
    expect(mapped[CRM_FIELD_MAPPING.intent]).toBe("project");
    expect(mapped[CRM_FIELD_MAPPING.message]).toBe("Build a Next.js web application");
    expect(mapped[CRM_FIELD_MAPPING.locale]).toBe("en");
    expect(mapped[CRM_FIELD_MAPPING.source]).toBe("hero");
    expect(mapped[CRM_FIELD_MAPPING.utm_source]).toBe("google");
    expect(mapped[CRM_FIELD_MAPPING.utm_medium]).toBe("cpc");
    expect(mapped[CRM_FIELD_MAPPING.utm_campaign]).toBe("brand_search");
    expect(mapped[CRM_FIELD_MAPPING.utm_term]).toBe("cyberskill");
    expect(mapped[CRM_FIELD_MAPPING.utm_content]).toBe("header_logo");
    expect(mapped.owner).toBe("CyberSkill Sales Team");
    expect(mapped.status).toBe("New");
  });

  test("api/lead-crm-mapping: maps transcripts in CRM payloads correctly", () => {
    const lead = {
      name: "Alice",
      email: "alice@example.com",
      intent: "partnership" as const,
      consent: true,
      locale: "vi" as const,
      transcript: [
        { sender: "Visitor", text: "Xin chào Lumi" },
        { sender: "Lumi", text: "Chào Alice! Tôi giúp gì được bạn?" },
      ],
    };

    const mapped = mapLeadToCrm(lead);
    expect(mapped[CRM_FIELD_MAPPING.transcript]).toContain("[Visitor]: Xin chào Lumi");
    expect(mapped[CRM_FIELD_MAPPING.transcript]).toContain("[Lumi]: Chào Alice! Tôi giúp gì được bạn?");
  });

  // --- FR-CHAR-027: Transcript Notifications in Slack & Email ---
  test("genie/crm-handoff: appends chat transcript to Resend email and Slack notifications", async () => {
    process.env.RESEND_API_KEY = "mock-resend-key";
    process.env.LEAD_CRM_WEBHOOK_URL = "http://mock-crm/leads";
    process.env.LEAD_SLACK_WEBHOOK_URL = "http://mock-slack/webhook";

    // Mock fetch for Resend, Slack, and CRM Webhook
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    });

    const leadPayload = {
      name: "Bob",
      email: "bob@example.com",
      intent: "careers" as const,
      consent: true,
      locale: "en" as const,
      source: "lumi-chat",
      transcript: [
        { sender: "Visitor", text: "I want to apply for a frontend role" },
        { sender: "Lumi", text: "Great, tell me your experience" },
      ],
    };

    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify(leadPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify CRM mapping call
    const crmCall = (global.fetch as any).mock.calls.find((c: any) => c[0] === "http://mock-crm/leads");
    expect(crmCall).toBeDefined();
    const crmBody = JSON.parse(crmCall[1].body);
    expect(crmBody[CRM_FIELD_MAPPING.transcript]).toContain("[Visitor]: I want to apply for a frontend role");

    // Verify Slack notification contains transcript
    const slackCall = (global.fetch as any).mock.calls.find((c: any) => c[0] === "http://mock-slack/webhook");
    expect(slackCall).toBeDefined();
    const slackBody = JSON.parse(slackCall[1].body);
    expect(slackBody.text).toContain("Chat Transcript:");
    expect(slackBody.text).toContain("Visitor*: I want to apply for a frontend role");
    expect(slackBody.text).toContain("Lumi*: Great, tell me your experience");

    // Verify Email notification contains transcript
    const emailCall = (global.fetch as any).mock.calls.find((c: any) => c[0] === "https://api.resend.com/emails");
    expect(emailCall).toBeDefined();
    const emailBody = JSON.parse(emailCall[1].body);
    expect(emailBody.text).toContain("--- Chat Transcript ---");
    expect(emailBody.text).toContain("[Visitor]: I want to apply for a frontend role");
    expect(emailBody.text).toContain("[Lumi]: Great, tell me your experience");
  });

  // --- Error tracking (FR-OPS-010 check) ---
  test("lead/total-failure-alert: logs a pipeline failure error when all active sinks fail", async () => {
    process.env.VITEST_FORCE_PROD = "true";
    process.env.LEAD_STORE_DIR = "/read-only-or-invalid-dir/leads";
    process.env.RESEND_API_KEY = "mock-resend-key";
    process.env.LEAD_CRM_WEBHOOK_URL = "http://mock-crm/leads";
    process.env.LEAD_SLACK_WEBHOOK_URL = "http://mock-slack/webhook";

    // Mock fetch to fail for all endpoints
    (global.fetch as any).mockRejectedValue(new Error("connection reset"));

    const leadPayload = {
      name: "Failure Tester",
      email: "fail@example.com",
      intent: "other" as const,
      consent: true,
      locale: "en" as const,
    };

    const req = new Request("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify(leadPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200); // user should still get 200 ok (best-effort design)

    // Check that console.error was called with the pipeline failure message
    expect(console.error).toHaveBeenCalled();
    const errorCall = (console.error as any).mock.calls.find((args: any) =>
      args[0].includes("[lead] pipeline failure")
    );
    expect(errorCall).toBeDefined();
  });
});
