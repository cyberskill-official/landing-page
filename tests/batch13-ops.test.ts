import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as feedGet } from "@/app/[lang]/feed.xml/route";
import { GET as llmsGet } from "@/app/llms.txt/route";
import { GET as llmsFullGet } from "@/app/llms-full.txt/route";
import { GET as pruneGet } from "@/app/api/cron/prune/route";
import nextConfig from "../next.config";

describe("FR-OPS-017: CDN Cache-Control Headers", () => {
  it("perf/xml-cache-headers: GET dynamic sitemaps and dynamic feeds carry Cache-Control headers with s-maxage", async () => {
    // 1. RSS Feed XML
    const feedReq = new Request("https://cyberskill.world/en/feed.xml");
    const feedRes = await feedGet(feedReq, { params: Promise.resolve({ lang: "en" }) });
    expect(feedRes.status).toBe(200);
    expect(feedRes.headers.get("Content-Type")).toContain("application/xml");
    
    const feedCache = feedRes.headers.get("Cache-Control") || "";
    expect(feedCache).toContain("public");
    expect(feedCache).toContain("s-maxage=86400");
    expect(feedCache).toContain("stale-while-revalidate=3600");

    // 2. Dynamic sitemap via Next config headers configuration
    const configHeaders = await nextConfig.headers();
    const sitemapHeaderObj = configHeaders.find(h => h.source === "/sitemap.xml");
    expect(sitemapHeaderObj).toBeDefined();
    
    const sitemapCacheHeader = sitemapHeaderObj?.headers.find(h => h.key === "Cache-Control");
    expect(sitemapCacheHeader).toBeDefined();
    expect(sitemapCacheHeader?.value).toContain("public");
    expect(sitemapCacheHeader?.value).toContain("s-maxage=86400");
    expect(sitemapCacheHeader?.value).toContain("stale-while-revalidate=3600");
  });

  it("perf/llms-cache-headers: GET /llms.txt and /llms-full.txt carry Cache-Control headers with s-maxage", async () => {
    // 1. llms.txt
    const llmsRes = await llmsGet();
    expect(llmsRes.status).toBe(200);
    const llmsCache = llmsRes.headers.get("Cache-Control") || "";
    expect(llmsCache).toContain("public");
    expect(llmsCache).toContain("s-maxage=86400");
    expect(llmsCache).toContain("stale-while-revalidate=3600");

    // 2. llms-full.txt
    const llmsFullRes = await llmsFullGet();
    expect(llmsFullRes.status).toBe(200);
    const llmsFullCache = llmsFullRes.headers.get("Cache-Control") || "";
    expect(llmsFullCache).toContain("public");
    expect(llmsFullCache).toContain("s-maxage=86400");
    expect(llmsFullCache).toContain("stale-while-revalidate=3600");
  });

  it("perf/cdn-cache-validation: CDN caching directives match the s-maxage=86400, stale-while-revalidate=3600 pattern", async () => {
    const feedReq = new Request("https://cyberskill.world/vi/feed.xml");
    const feedRes = await feedGet(feedReq, { params: Promise.resolve({ lang: "vi" }) });
    const cacheHeader = feedRes.headers.get("Cache-Control") || "";
    expect(cacheHeader).toBe("public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600");
  });
});

describe("FR-OPS-018: Prune Cron Endpoint Security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, CRON_SECRET: "super-secret-cron-token", NODE_ENV: "production" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("security/cron-token-validation: missing or incorrect secrets are rejected with 401 Unauthorized", async () => {
    // 1. No secret
    const req1 = new Request("https://cyberskill.world/api/cron/prune");
    const res1 = await pruneGet(req1);
    expect(res1.status).toBe(401);
    const data1 = await res1.json();
    expect(data1.ok).toBe(false);

    // 2. Bad query secret
    const req2 = new Request("https://cyberskill.world/api/cron/prune?secret=wrong-token");
    const res2 = await pruneGet(req2);
    expect(res2.status).toBe(401);

    // 3. Correct query secret
    const req3 = new Request("https://cyberskill.world/api/cron/prune?secret=super-secret-cron-token");
    const res3 = await pruneGet(req3);
    // Should get past auth (it might prune 0 records or fail on db mock, but status is not 401)
    expect(res3.status).not.toBe(401);

    // 4. Correct Auth header secret
    const req4 = new Request("https://cyberskill.world/api/cron/prune", {
      headers: { Authorization: "Bearer super-secret-cron-token" }
    });
    const res4 = await pruneGet(req4);
    expect(res4.status).not.toBe(401);
  });

  it("security/cron-signature-failure: expired signatures or invalid formatting fail immediately with 400", async () => {
    // 1. Expired signature timestamp (e.g. t is more than 5 minutes old)
    const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 6.6 minutes ago
    const req1 = new Request("https://cyberskill.world/api/cron/prune?secret=super-secret-cron-token", {
      headers: { "x-vercel-signature": `t=${oldTimestamp}` }
    });
    const res1 = await pruneGet(req1);
    expect(res1.status).toBe(400);
    const data1 = await res1.json();
    expect(data1.error).toBe("signature expired");
    expect(data1.error).toContain("signature");

    // 2. Bad signature format
    const req2 = new Request("https://cyberskill.world/api/cron/prune?secret=super-secret-cron-token", {
      headers: { "x-vercel-signature": "bad-format" }
    });
    const res2 = await pruneGet(req2);
    expect(res2.status).toBe(400);
    const data2 = await res2.json();
    expect(data2.error).toContain("signature");

    // 3. Valid timestamp (should pass signature checks)
    const validTimestamp = Math.floor(Date.now() / 1000) - 30; // 30 seconds ago
    const req3 = new Request("https://cyberskill.world/api/cron/prune?secret=super-secret-cron-token", {
      headers: { "x-vercel-signature": `t=${validTimestamp}` }
    });
    const res3 = await pruneGet(req3);
    expect(res3.status).not.toBe(400);
  });

  it("security/cron-audit-logging: execution is logged securely and masks record details", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    
    const req = new Request("https://cyberskill.world/api/cron/prune?secret=super-secret-cron-token");
    const res = await pruneGet(req);
    expect(res.status).toBe(200);

    expect(consoleLogSpy).toHaveBeenCalled();
    const lastCallArg = consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1][0];
    
    // Log must contain pruned count, duration, and endpoint name, but absolutely no individual record details
    expect(lastCallArg).toContain("[cron/prune] Pruning successful");
    expect(lastCallArg).toContain("prunedCount");
    expect(lastCallArg).toContain("durationMs");
    
    // Must not leak user email or transcript text (we check that it doesn't look like JSON record list)
    expect(lastCallArg).not.toContain("@");
    expect(lastCallArg).not.toContain("sessionId");
  });
});
