import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health route (TASK-WEB-010)", () => {
  it("returns 200 with an ok status and a parseable timestamp", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as { status: string; service: string; version: string; ts: string };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("cyberskill-landing-page");
    expect(typeof body.version).toBe("string");
    expect(body.version.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(body.ts))).toBe(false);
  });
});
