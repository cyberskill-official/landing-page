import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as geniePost } from "@/app/api/genie/route";

describe("FR-CHAR-029: Abuse Hardening and Durable Rate Limiting", () => {
  const originalEnv = process.env;
  let fetchSpy: any;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ANTHROPIC_API_KEY: "mock-anthropic-key",
      NODE_ENV: "test",
    };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("genie/rate-limit-durable: queries Vercel KV REST pipeline when configured", async () => {
    process.env.KV_REST_API_URL = "https://mock-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "mock-token";

    let kvPipelineCalled = false;
    let kvExpireCalled = false;

    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const urlStr = typeof input === "string" ? input : input?.url || "";

      if (urlStr.includes("api.anthropic.com")) {
        // Mock SSE stream format or standard Response
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"type": "content_block_delta", "delta": {"type": "text_delta", "text": "Hello client!"}}\n\n'));
            controller.close();
          }
        });
        return new Response(stream, { status: 200 });
      }

      if (urlStr.includes("mock-kv.upstash.io/pipeline")) {
        kvPipelineCalled = true;
        // Mock response for INCR and TTL
        return new Response(JSON.stringify([{ result: 5 }, { result: 250 }]), { status: 200 });
      }

      if (urlStr.includes("mock-kv.upstash.io/expire")) {
        kvExpireCalled = true;
        return new Response(JSON.stringify({ result: true }), { status: 200 });
      }

      return new Response("Not Found", { status: 404 });
    });

    const req = new Request("https://cyberskill.world/api/genie", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello Genie!" }],
        locale: "en"
      }),
    });

    const res = await geniePost(req);
    expect(res.status).toBe(200);
    expect(kvPipelineCalled).toBe(true);
    // Since count (5) is not 1 and ttl (250) is not -1, expire shouldn't be called
    expect(kvExpireCalled).toBe(false);
  });

  it("genie/rate-limit-durable: sets expiration on new rate limit windows", async () => {
    process.env.KV_REST_API_URL = "https://mock-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "mock-token";

    let kvExpireCalled = false;

    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const urlStr = typeof input === "string" ? input : input?.url || "";

      if (urlStr.includes("api.anthropic.com")) {
        return new Response(new ReadableStream({
          start(controller) {
            controller.close();
          }
        }), { status: 200 });
      }

      if (urlStr.includes("mock-kv.upstash.io/pipeline")) {
        // INCR returns 1 (new window)
        return new Response(JSON.stringify([{ result: 1 }, { result: -1 }]), { status: 200 });
      }

      if (urlStr.includes("mock-kv.upstash.io/expire")) {
        kvExpireCalled = true;
        return new Response(JSON.stringify({ result: true }), { status: 200 });
      }

      return new Response("Not Found", { status: 404 });
    });

    const req = new Request("https://cyberskill.world/api/genie", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello Genie!" }],
      }),
    });

    const res = await geniePost(req);
    expect(res.status).toBe(200);
    expect(kvExpireCalled).toBe(true);
  });

  it("genie/fail-safe-429: limits requests consistently when threshold is exceeded", async () => {
    process.env.KV_REST_API_URL = "https://mock-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "mock-token";

    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const urlStr = typeof input === "string" ? input : input?.url || "";

      if (urlStr.includes("mock-kv.upstash.io/pipeline")) {
        // Return 21 requests (threshold is 20) and 180s remaining
        return new Response(JSON.stringify([{ result: 21 }, { result: 180 }]), { status: 200 });
      }

      return new Response("Not Found", { status: 404 });
    });

    const req = new Request("https://cyberskill.world/api/genie", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello Genie!" }],
      }),
    });

    const res = await geniePost(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("180");
    const data = await res.json();
    expect(data.error).toBe("rate_limited");
  });

  it("genie/rate-limit-fallback: gracefully falls back to local in-memory limiter when KV fails", async () => {
    process.env.KV_REST_API_URL = "https://mock-kv.upstash.io";
    process.env.KV_REST_API_TOKEN = "mock-token";

    let consoleErrorCalled = false;
    const originalConsoleError = console.error;
    console.error = () => { consoleErrorCalled = true; };

    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const urlStr = typeof input === "string" ? input : input?.url || "";

      if (urlStr.includes("api.anthropic.com")) {
        return new Response(new ReadableStream({ start(c) { c.close(); } }), { status: 200 });
      }

      if (urlStr.includes("mock-kv.upstash.io")) {
        // KV throws an error or returns bad status
        return new Response("Internal Server Error", { status: 500 });
      }

      return new Response("Not Found", { status: 404 });
    });

    // Make 22 local requests (exceeding local MAX_REQ = 20)
    for (let i = 0; i < 22; i++) {
      const req = new Request("https://cyberskill.world/api/genie", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: `Hello Genie ${i}!` }],
        }),
        headers: {
          "x-forwarded-for": "1.2.3.4", // fixed IP to trigger rate limiter
        }
      });
      const res = await geniePost(req);
      if (i < 20) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429);
      }
    }

    expect(consoleErrorCalled).toBe(true);
    console.error = originalConsoleError;
  });
});
