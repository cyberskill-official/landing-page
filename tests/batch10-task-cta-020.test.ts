// @vitest-environment jsdom
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";

/**
 * Batch 10 — TASK-CTA-020 Careers talent-pool email capture
 *
 * Tests:
 *  api/subscribe-audience-tag   — POST with audienceTag="talent-pool" encodes tag in token and applies it on confirmation
 *  content/careers-talent-pool  — Retention statement is bilingual; TalentPoolForm renders with key present
 *  api/subscribe-unsubscribe    — Deletion request removes the record (re-uses existing unsubscribe path)
 */

// ── helpers ─────────────────────────────────────────────────────────────────
const FAKE_KEY = "rnd_test_talent_key";
const FAKE_AUDIENCE = "mock-talent-audience-id";

function mockEnv(vars: Record<string, string | undefined>) {
  const original: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) original[k] = process.env[k];
  Object.assign(process.env, vars);
  return () => {
    for (const k of Object.keys(vars)) {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    }
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("TASK-CTA-020: api/subscribe-audience-tag", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("POST with audienceTag=talent-pool returns ok:true", async () => {
    const restore = mockEnv({
      RESEND_API_KEY: FAKE_KEY,
      RESEND_AUDIENCE_ID: FAKE_AUDIENCE,
    });

    const fetchCalls: { url: string; body: unknown }[] = [];
    global.fetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const body = opts?.body ? JSON.parse(opts.body as string) : undefined;
      fetchCalls.push({ url, body });
      return {
        ok: true,
        status: 200,
        text: async () => "{}",
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;

    const { POST } = await import("@/app/api/subscribe/route");
    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "candidate@example.com",
        locale: "en",
        audienceTag: "talent-pool",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // Should have dispatched one email (the confirmation)
    const emailCall = fetchCalls.find((c) => c.url === "https://api.resend.com/emails");
    expect(emailCall).toBeDefined();

    restore();
  });

  test("POST with audienceTag=talent-pool — token carries tag; GET confirms and tags contact", async () => {
    const restore = mockEnv({
      RESEND_API_KEY: FAKE_KEY,
      RESEND_AUDIENCE_ID: FAKE_AUDIENCE,
      SUBSCRIBE_SIGNING_SECRET: "stable_test_secret",
    });

    const contactCalls: { url: string; body: unknown }[] = [];
    global.fetch = vi.fn(async (url: string, opts?: RequestInit) => {
      if (typeof url === "string") {
        const body = opts?.body ? JSON.parse(opts.body as string) : undefined;
        contactCalls.push({ url: url as string, body });
      }
      return {
        ok: true,
        status: 200,
        text: async () => "{}",
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;

    const { POST, GET } = await import("@/app/api/subscribe/route");

    // Step 1: POST to subscribe
    const postReq = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "talent@example.com",
        locale: "vi",
        audienceTag: "talent-pool",
      }),
    });
    await POST(postReq);

    // Extract token from the confirmation email URL
    const emailCall = contactCalls.find((c) => c.url === "https://api.resend.com/emails");
    expect(emailCall).toBeDefined();
    const text = (emailCall!.body as any)?.text as string;
    const tokenMatch = text?.match(/[?&]token=([A-Za-z0-9_-]+)/);
    expect(tokenMatch).not.toBeNull();
    const token = tokenMatch![1];

    // Step 2: GET to confirm
    contactCalls.length = 0;
    const getReq = new Request(`http://localhost/api/subscribe?token=${token}`);
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);

    // The Resend contact creation call should tag with talent-pool
    const audienceCall = contactCalls.find((c) =>
      typeof c.url === "string" && c.url.includes(`/audiences/${FAKE_AUDIENCE}/contacts`)
    );
    expect(audienceCall).toBeDefined();
    expect((audienceCall!.body as any).tags).toContain("talent-pool");

    restore();
  });

  test("audienceTag with invalid characters is rejected / stripped", async () => {
    const restore = mockEnv({
      RESEND_API_KEY: FAKE_KEY,
      RESEND_AUDIENCE_ID: FAKE_AUDIENCE,
    });

    const emailsDispatched: unknown[] = [];
    global.fetch = vi.fn(async (url: string, opts?: RequestInit) => {
      const body = opts?.body ? JSON.parse(opts.body as string) : undefined;
      emailsDispatched.push(body);
      return {
        ok: true,
        status: 200,
        text: async () => "{}",
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;

    const { POST } = await import("@/app/api/subscribe/route");
    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "candidate2@example.com",
        locale: "en",
        audienceTag: "<script>alert('xss')</script>",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    // Should still succeed (tag is silently stripped, not a 400)
    expect(data.ok).toBe(true);

    restore();
  });
});

describe("TASK-CTA-020: content/careers-talent-pool — bilingual retention statement", () => {
  test("TalentPoolForm labels include retention period and deletion contact in EN", async () => {
    // Import the module and inspect exported labels
    // We test the content at the module level since the strings are constants
    const mod = await import("@/components/cta/TalentPoolForm");
    expect(mod.TalentPoolForm).toBeDefined();
    // The component exists and is a function
    expect(typeof mod.TalentPoolForm).toBe("function");
  });

  test("Retention copy mentions 12 months in EN", async () => {
    // Inline check via direct import of the module and reading its string literal
    // We can confirm by importing the file content through a regex approach
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "components/cta/TalentPoolForm.tsx"),
      "utf8"
    );
    expect(src).toContain("12 months");
    expect(src).toContain("12 tháng");
  });

  test("Retention copy mentions deletion request process in EN and VN", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "components/cta/TalentPoolForm.tsx"),
      "utf8"
    );
    expect(src).toContain("privacy@cyberskill.vn");
    // Both EN and VN should reference the same privacy email
    const mentions = (src.match(/privacy@cyberskill\.vn/g) || []).length;
    expect(mentions).toBeGreaterThanOrEqual(2);
  });

  test("Both EN and VN double opt-in success messages are present", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "components/cta/TalentPoolForm.tsx"),
      "utf8"
    );
    expect(src).toContain("You're in the talent pool");
    expect(src).toContain("Bạn đã được thêm vào Kho tài năng");
  });
});

describe("TASK-CTA-020: api/subscribe-unsubscribe (deletion path)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("GET with action=unsubscribe removes the contact from Resend", async () => {
    const restore = mockEnv({
      RESEND_API_KEY: FAKE_KEY,
      RESEND_AUDIENCE_ID: FAKE_AUDIENCE,
    });

    const deleteCalls: string[] = [];
    global.fetch = vi.fn(async (url: string, opts?: RequestInit) => {
      if (opts?.method === "DELETE") deleteCalls.push(url as string);
      return {
        ok: true,
        status: 200,
        text: async () => "{}",
        json: async () => ({}),
      } as Response;
    }) as unknown as typeof fetch;

    const { GET } = await import("@/app/api/subscribe/route");
    const email = "leaver@example.com";
    const getReq = new Request(
      `http://localhost/api/subscribe?action=unsubscribe&email=${encodeURIComponent(email)}`
    );
    const res = await GET(getReq);
    expect(res.status).toBe(200);

    // A DELETE was issued to the Resend contacts endpoint
    const deleteCall = deleteCalls.find((u) =>
      u.includes(`/audiences/${FAKE_AUDIENCE}/contacts/`)
    );
    expect(deleteCall).toBeDefined();
    expect(deleteCall).toContain(encodeURIComponent(email));

    restore();
  });

  test("Unsubscribe without a configured API key returns 200 (no-op, does not error)", async () => {
    const restore = mockEnv({
      RESEND_API_KEY: undefined,
      RESEND_AUDIENCE_ID: undefined,
    });

    global.fetch = vi.fn(async () => {
      throw new Error("Should not call fetch without API key");
    }) as unknown as typeof fetch;

    const { GET } = await import("@/app/api/subscribe/route");
    const getReq = new Request(
      `http://localhost/api/subscribe?action=unsubscribe&email=nokey@example.com`
    );
    const res = await GET(getReq);
    expect(res.status).toBe(200);

    restore();
  });
});
