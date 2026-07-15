// @vitest-environment jsdom
import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { POST, GET } from "@/app/api/subscribe/route";

describe("Batch 9 Commit 3 tests — TASK-CTA-014 (Newsletter Double Opt-in)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // --- Honeypot & Validation ---
  test("api/subscribe-validation: rejects invalid email with 400", async () => {
    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email", locale: "en" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("invalid_email");
  });

  test("api/subscribe-validation: honeypot fields trigger mock success", async () => {
    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", locale: "en", website: "bot-spam" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    // Fetch should not have been called because it is blocked by honeypot
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // --- Env Gating ---
  test("api/subscribe-env-gate: no-ops safely when RESEND_API_KEY is absent", async () => {
    delete process.env.RESEND_API_KEY;

    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", locale: "en" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.note).toBe("provider_env_missing_noop");
  });

  // --- Double Opt-In Flow & Unsubscribe ---
  test("api/subscribe-double-optin: generates confirmation token, sends email, and verifies token via GET", async () => {
    process.env.RESEND_API_KEY = "mock-resend-key";
    
    // Mock the email dispatch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "ok",
    });

    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: "prospect@example.com", locale: "en" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // Verify confirmation email dispatch
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toBe("https://api.resend.com/emails");
    const mailPayload = JSON.parse(callArgs[1].body);
    expect(mailPayload.to).toContain("prospect@example.com");
    expect(mailPayload.subject).toContain("Confirm your");

    // Extract token from verification url
    const confirmUrl = mailPayload.text.match(/https?:\/\/[^\s]+/)[0];
    const url = new URL(confirmUrl);
    const token = url.searchParams.get("token") || "";
    expect(token).toBeTruthy();

    // Verify token via GET
    // Mock adding to audience
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "ok",
    });

    process.env.RESEND_AUDIENCE_ID = "mock-audience-id";
    const getReq = new Request(`http://localhost/api/subscribe?token=${token}`);
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);

    const html = await getRes.text();
    expect(html).toContain("Subscription Confirmed!");

    // Verify contact creation call
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const apiCall = (global.fetch as any).mock.calls[1];
    expect(apiCall[0]).toContain("audiences/mock-audience-id/contacts");
    const contactPayload = JSON.parse(apiCall[1].body);
    expect(contactPayload.email).toBe("prospect@example.com");
  });

  test("api/subscribe-unsubscribe: deletes subscriber from audience list", async () => {
    process.env.RESEND_API_KEY = "mock-resend-key";
    process.env.RESEND_AUDIENCE_ID = "mock-audience-id";

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "deleted",
    });

    const req = new Request("http://localhost/api/subscribe?action=unsubscribe&email=prospect@example.com");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Unsubscribed");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const unsubCall = (global.fetch as any).mock.calls[0];
    expect(unsubCall[0]).toContain("audiences/mock-audience-id/contacts/prospect%40example.com");
    expect(unsubCall[1].method).toBe("DELETE");
  });
});
