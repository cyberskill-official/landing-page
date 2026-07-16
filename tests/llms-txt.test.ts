/**
 * Lighthouse agentic-browsing `llms-txt` audit requires Markdown with an H1
 * and at least one Markdown hyperlink. Drive the real builders + route handlers.
 */
import { describe, it, expect } from "vitest";
import { buildLlmsFullTxt, buildLlmsTxt } from "@/lib/seo/llms-content";
import { GET as getLlms } from "@/app/llms.txt/route";
import { GET as getLlmsFull } from "@/app/llms-full.txt/route";
import { siteUrl } from "@/lib/content/site";

function assertLlmsMarkdown(body: string) {
  // H1 required by llmstxt.org / Lighthouse llms-txt
  expect(body.trimStart().startsWith("# ")).toBe(true);
  expect(body).toMatch(/^# .+/m);
  // Markdown hyperlink(s) — bare URLs alone fail "does not appear to contain any links"
  expect(body).toMatch(/\[[^\]]+\]\(https?:\/\/[^)]+\)/);
  // At least one site URL as a proper Markdown link
  expect(body).toContain(`](${siteUrl}`);
}

describe("llms.txt Markdown contract (Lighthouse llms-txt)", () => {
  it("buildLlmsTxt() emits H1 + Markdown links", () => {
    const body = buildLlmsTxt();
    assertLlmsMarkdown(body);
    expect(body).toContain("## Key URLs");
    expect(body).toContain(`[${siteUrl}](${siteUrl})`);
    expect(body).toContain(`](${siteUrl}/en/careers)`);
  });

  it("buildLlmsFullTxt() emits H1 + Markdown links", () => {
    const body = buildLlmsFullTxt();
    assertLlmsMarkdown(body);
    expect(body).toContain("Full Specification");
    expect(body).toContain(`](${siteUrl}/llms.txt)`);
  });

  it("GET /llms.txt handler returns text body with H1 + links", async () => {
    const res = await getLlms();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const body = await res.text();
    assertLlmsMarkdown(body);
  });

  it("GET /llms-full.txt handler returns text body with H1 + links", async () => {
    const res = await getLlmsFull();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/text\/plain/);
    const body = await res.text();
    assertLlmsMarkdown(body);
  });
});
