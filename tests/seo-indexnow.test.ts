import { describe, it, expect, vi } from "vitest";
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_MAX_URLS_PER_REQUEST,
  isValidIndexNowKey,
  getIndexNowKey,
  keyLocationFor,
  chunkUrls,
  buildPayload,
  sitemapUrls,
  submitUrls,
} from "@/lib/seo/indexnow";
import { GET as keyRoute } from "@/app/indexnow/[key]/route";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/content/site";

// TASK-SEO-021. Bing Webmaster Tools, 2026-07-29, listed IndexNow as the single
// Top Recommendation for this property and the repo had no implementation.

const KEY = "0123456789abcdef0123456789abcdef";
const params = (key: string) => ({ params: Promise.resolve({ key }) });
const req = () => new Request(`${siteUrl}/indexnow/${KEY}.txt`);

describe("seo/indexnow-key-validation (TASK-SEO-021 §1.6)", () => {
  it("accepts a protocol-conformant key", () => {
    expect(isValidIndexNowKey(KEY)).toBe(true);
    expect(isValidIndexNowKey("abcdef12")).toBe(true); // 8, the lower bound
    expect(isValidIndexNowKey("a".repeat(128))).toBe(true); // 128, the upper bound
  });

  it("rejects a key that is too short, too long, or non-hexadecimal", () => {
    expect(isValidIndexNowKey("abc123")).toBe(false); // 6
    expect(isValidIndexNowKey("a".repeat(129))).toBe(false);
    expect(isValidIndexNowKey("not-hex-at-all!!")).toBe(false);
    expect(isValidIndexNowKey("")).toBe(false);
    expect(isValidIndexNowKey(undefined)).toBe(false);
  });

  it("rejects a key carrying path separators, closing the traversal surface (§3)", () => {
    expect(isValidIndexNowKey("../../etc/passwd")).toBe(false);
    expect(isValidIndexNowKey("abc/def12345")).toBe(false);
    expect(isValidIndexNowKey("abc.def12345")).toBe(false);
  });

  it("treats an invalid configured key as absent", () => {
    expect(getIndexNowKey({ INDEXNOW_KEY: "short" })).toBeNull();
    expect(getIndexNowKey({ INDEXNOW_KEY: KEY })).toBe(KEY);
    expect(getIndexNowKey({})).toBeNull();
  });
});

describe("seo/indexnow-key-route (TASK-SEO-021 §1.1)", () => {
  it("returns 200 text/plain with exactly the configured key as its body", async () => {
    vi.stubEnv("INDEXNOW_KEY", KEY);
    const res = await keyRoute(req(), params(`${KEY}.txt`));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(await res.text()).toBe(KEY);
    vi.unstubAllEnvs();
  });

  it("serves the same body without the .txt suffix", async () => {
    vi.stubEnv("INDEXNOW_KEY", KEY);
    const res = await keyRoute(req(), params(KEY));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe(KEY);
    vi.unstubAllEnvs();
  });

  it("404s a request for any key other than the configured one", async () => {
    vi.stubEnv("INDEXNOW_KEY", KEY);
    const res = await keyRoute(req(), params("ffffffffffffffffffffffffffffffff.txt"));
    expect(res.status).toBe(404);
    vi.unstubAllEnvs();
  });
});

describe("seo/indexnow-degrades-without-key (TASK-SEO-021 §1.3)", () => {
  it("404s the key route when no key is configured", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    const res = await keyRoute(req(), params(`${KEY}.txt`));
    expect(res.status).toBe(404);
    vi.unstubAllEnvs();
  });

  it("skips submission without making a request", async () => {
    const fetchImpl = vi.fn();
    const result = await submitUrls([`${siteUrl}/en`], { key: null, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("skipped");
    expect(result.submitted).toBe(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skips an empty URL list rather than posting an empty urlList (§3)", async () => {
    const fetchImpl = vi.fn();
    const result = await submitUrls([], { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("seo/indexnow-payload (TASK-SEO-021 §1.2)", () => {
  it("builds the documented payload shape", () => {
    const payload = buildPayload(KEY, [`${siteUrl}/en`], siteUrl);

    expect(payload).toEqual({
      host: new URL(siteUrl).host,
      key: KEY,
      keyLocation: `${siteUrl}/${KEY}.txt`,
      urlList: [`${siteUrl}/en`],
    });
  });

  it("POSTs JSON to the shared endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await submitUrls([`${siteUrl}/en`], { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(INDEXNOW_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toContain("application/json");
    expect(JSON.parse(init.body).key).toBe(KEY);
  });

  it("chunks a list longer than the per-request cap into multiple requests", async () => {
    const many = Array.from({ length: INDEXNOW_MAX_URLS_PER_REQUEST + 5 }, (_, i) => `${siteUrl}/en/p${i}`);
    expect(chunkUrls(many)).toHaveLength(2);
    expect(chunkUrls(many)[0]).toHaveLength(INDEXNOW_MAX_URLS_PER_REQUEST);
    expect(chunkUrls(many)[1]).toHaveLength(5);

    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const result = await submitUrls(many, { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ status: "ok", submitted: many.length, requests: 2 });
  });

  it("de-duplicates so a repeated URL does not spend the quota twice (§3)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const result = await submitUrls([`${siteUrl}/en`, `${siteUrl}/en`, `${siteUrl}/vi`], {
      key: KEY,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toMatchObject({ status: "ok", submitted: 2 });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).urlList).toEqual([`${siteUrl}/en`, `${siteUrl}/vi`]);
  });

  it("points keyLocation at the ROOT, which is what scopes the whole host (§3)", () => {
    expect(keyLocationFor(KEY)).toBe(`${siteUrl}/${KEY}.txt`);
  });

  it("keeps every submitted URL inside the keyLocation directory (§1.7)", () => {
    // The rule that produced a live 422: IndexNow scopes a submission by the
    // directory holding the key file. A key at /indexnow/<key>.txt authorises
    // only URLs under /indexnow/, so the whole sitemap was out of scope. Root
    // placement is the only thing that makes the host submittable, and this
    // asserts the invariant rather than the string.
    const keyDir = keyLocationFor(KEY).slice(0, keyLocationFor(KEY).lastIndexOf("/") + 1);

    expect(keyDir).toBe(`${siteUrl}/`);
    for (const url of sitemapUrls()) expect(url.startsWith(keyDir)).toBe(true);
  });
});

describe("seo/indexnow-never-throws (TASK-SEO-021 §1.4)", () => {
  it("resolves a 500 to a non-throwing failure result", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    const result = await submitUrls([`${siteUrl}/en`], { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("failed");
    expect(result).toMatchObject({ httpStatus: 500 });
  });

  it("resolves a network error to a non-throwing failure result", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const result = await submitUrls([`${siteUrl}/en`], { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result).toMatchObject({ status: "failed", reason: "ECONNRESET", submitted: 0 });
  });

  it("distinguishes a 422 key-verification fault from a transient failure (§3)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 422 }));
    const result = await submitUrls([`${siteUrl}/en`], { key: KEY, fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("failed");
    expect((result as { reason: string }).reason).toContain("could not be verified");
  });
});

describe("seo/indexnow-sitemap-parity (TASK-SEO-021 §1.5)", () => {
  it("derives its URL list from the same registry the sitemap uses", () => {
    const urls = sitemapUrls();
    const fromSitemap = sitemap().map((e) => e.url);

    expect(urls).toEqual(fromSitemap);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(`${siteUrl}/`)).toBe(true);
  });

  it("keeps no second copy of the URL list", () => {
    // Every submitted URL must be a sitemap URL: if the two lists could differ,
    // IndexNow would be advertising URLs the sitemap does not publish.
    const sitemapSet = new Set(sitemap().map((e) => e.url));
    for (const url of sitemapUrls()) expect(sitemapSet.has(url)).toBe(true);
  });
});
