import { expect, test, describe } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "../proxy";

describe("middleware routing", () => {
  test("routing/root-no-redirect: root path rewrites instead of redirects", () => {
    const req = new NextRequest("https://cyberskill.world/");
    const res = middleware(req);
    // NextResponse.rewrite sets the x-middleware-rewrite header.
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://cyberskill.world/en");
    // x-cs-locale is set in the request headers passed to rewrite. We can check the x-middleware-request-x-cs-locale header
    expect(res.headers.get("x-middleware-request-x-cs-locale")).toBe("en");
  });

  test("routing/root-cookie-priority: cookie overrides accept-language", () => {
    const req = new NextRequest("https://cyberskill.world/", {
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "cookie": "cs-locale=vi",
      },
    });
    const res = middleware(req);
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://cyberskill.world/vi");
    expect(res.headers.get("x-middleware-request-x-cs-locale")).toBe("vi");
  });
});
