import { siteUrl } from "@/lib/content/site";
import sitemap from "@/app/sitemap";

// TASK-SEO-021: IndexNow (https://www.bing.com/indexnow/getstarted).
//
// A push notification to Bing and Yandex that a URL changed, instead of waiting
// for their next crawl. Bing Webmaster Tools raised this as the single Top
// Recommendation for cyberskill.world on 2026-07-29.
//
// What this does NOT do: anything for Google. Google has not adopted IndexNow.
// It also does not make a thin page rank - it only shortens the interval
// between publishing and discovery on the engines that participate.
//
// Everything here degrades to a no-op when INDEXNOW_KEY is unset, so a deploy
// without the credential is missing a feature rather than broken (§1.3).

/** Shared endpoint. Participating engines syndicate submissions to each other. */
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

/** Protocol cap on URLs per request. */
export const INDEXNOW_MAX_URLS_PER_REQUEST = 10_000;

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export type IndexNowResult =
  | { status: "skipped"; reason: string; submitted: 0 }
  | { status: "ok"; submitted: number; requests: number }
  | { status: "failed"; reason: string; submitted: 0; httpStatus?: number };

/**
 * §1.6: the protocol requires a key of 8 to 128 hexadecimal characters.
 * Validating before use also keeps the key route free of a path-traversal
 * surface: a key containing "/" or ".." can never reach the filesystem or the
 * route comparison, because it is rejected here first (§3).
 */
export function isValidIndexNowKey(key: string | undefined | null): key is string {
  if (!key) return false;
  return /^[0-9a-fA-F]{8,128}$/.test(key);
}

/** A readable environment. Looser than NodeJS.ProcessEnv so a test can pass a literal. */
export type EnvLike = Record<string, string | undefined>;

/** The configured key, or null when absent or malformed (§1.3, §1.6). */
export function getIndexNowKey(env: EnvLike = process.env): string | null {
  const key = env.INDEXNOW_KEY?.trim();
  return isValidIndexNowKey(key) ? key : null;
}

/**
 * Where the key file is served. Next.js already owns the root dynamic segment
 * for `[lang]`, so the key file cannot live at `/<key>.txt` without colliding
 * with locale routing. The protocol covers exactly this case with
 * `keyLocation`, which points the engine at the real location.
 */
export function keyLocationFor(key: string, base: string = siteUrl): string {
  return `${base}/indexnow/${key}.txt`;
}

/** Split a list into protocol-sized batches (§1.2). */
export function chunkUrls(
  urls: string[],
  size: number = INDEXNOW_MAX_URLS_PER_REQUEST,
): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < urls.length; i += size) out.push(urls.slice(i, i + size));
  return out;
}

/** The documented request body (§1.2). */
export function buildPayload(key: string, urls: string[], base: string = siteUrl): IndexNowPayload {
  return {
    host: new URL(base).host,
    key,
    keyLocation: keyLocationFor(key, base),
    urlList: urls,
  };
}

/**
 * Every URL the sitemap publishes (§1.5). Reads the sitemap function rather
 * than keeping a second list, so the two can never drift.
 */
export function sitemapUrls(): string[] {
  return sitemap().map((entry) => entry.url);
}

/**
 * Submit URLs to IndexNow.
 *
 * §1.4: never throws and never rejects. A search-engine outage is not a reason
 * to fail a deploy or a request, so every failure path resolves to a result
 * object the caller can log and move past.
 */
export async function submitUrls(
  urls: string[],
  opts: {
    key?: string | null;
    base?: string;
    fetchImpl?: typeof fetch;
    env?: EnvLike;
  } = {},
): Promise<IndexNowResult> {
  const base = opts.base ?? siteUrl;
  const key = opts.key !== undefined ? opts.key : getIndexNowKey(opts.env);
  const doFetch = opts.fetchImpl ?? fetch;

  if (!isValidIndexNowKey(key)) {
    return { status: "skipped", reason: "INDEXNOW_KEY is unset or not protocol-conformant", submitted: 0 };
  }

  // §3: de-duplicate so a repeated URL does not spend the quota twice.
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) {
    return { status: "skipped", reason: "no URLs to submit", submitted: 0 };
  }

  const batches = chunkUrls(unique);
  let submitted = 0;

  for (const batch of batches) {
    try {
      const res = await doFetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(buildPayload(key, batch, base)),
      });

      if (!res.ok) {
        return {
          status: "failed",
          // 422 means the engine could not verify the key file. That is a
          // configuration fault, not a transient one, and the caller needs to
          // be able to tell the difference (§3).
          reason:
            res.status === 422
              ? `key file at ${keyLocationFor(key, base)} could not be verified (422)`
              : `endpoint returned ${res.status}`,
          submitted: 0,
          httpStatus: res.status,
        };
      }
      submitted += batch.length;
    } catch (error) {
      return {
        status: "failed",
        reason: error instanceof Error ? error.message : "network error",
        submitted: 0,
      };
    }
  }

  return { status: "ok", submitted, requests: batches.length };
}
