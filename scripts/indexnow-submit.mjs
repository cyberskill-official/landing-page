#!/usr/bin/env node
// TASK-SEO-021 §1.5: submit every sitemap URL to IndexNow.
//
// Run after a publish:  npm run seo:indexnow
//
// The URL list is read from the deployed sitemap.xml, which is generated from
// lib/content/metadata.ts - the same registry the head hreflang uses. Nothing
// here keeps a second list of URLs.
//
// Degrades rather than fails (§1.3, §1.4): with no INDEXNOW_KEY it prints a
// skip and exits 0, and a non-2xx from the endpoint is reported without a
// non-zero exit, so this can sit in a deploy chain without becoming a new way
// for a search-engine outage to break a release.

const ENDPOINT = "https://api.indexnow.org/IndexNow";
const MAX_URLS_PER_REQUEST = 10_000;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cyberskill.world").replace(/\/$/, "");
const key = process.env.INDEXNOW_KEY?.trim();
const dryRun = process.argv.includes("--dry-run");

function isValidKey(k) {
  return typeof k === "string" && /^[0-9a-fA-F]{8,128}$/.test(k);
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

async function readSitemapUrls(base) {
  const res = await fetch(`${base}/sitemap.xml`, { headers: { Accept: "application/xml" } });
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  // <loc> only - the xhtml:link alternates are the same URLs in another shape.
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(locs)];
}

async function main() {
  if (!isValidKey(key)) {
    console.log("indexnow: skipped - INDEXNOW_KEY is unset or not 8-128 hex characters");
    return;
  }

  let urls;
  try {
    urls = await readSitemapUrls(siteUrl);
  } catch (error) {
    console.log(`indexnow: skipped - could not read sitemap (${error.message})`);
    return;
  }

  if (urls.length === 0) {
    console.log("indexnow: skipped - sitemap contained no URLs");
    return;
  }

  const batches = chunk(urls, MAX_URLS_PER_REQUEST);
  console.log(`indexnow: ${urls.length} URL(s) from ${siteUrl}/sitemap.xml in ${batches.length} request(s)`);

  if (dryRun) {
    console.log(`indexnow: dry run, nothing submitted`);
    for (const u of urls.slice(0, 5)) console.log(`  ${u}`);
    if (urls.length > 5) console.log(`  ... and ${urls.length - 5} more`);
    return;
  }

  for (const [i, batch] of batches.entries()) {
    const body = {
      host: new URL(siteUrl).host,
      key,
      // Root placement is required: the protocol scopes a submission by the
      // key file's directory, so a non-root key cannot authorise the whole host.
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: batch,
    };
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        console.log(`indexnow: batch ${i + 1}/${batches.length} accepted (${res.status})`);
      } else if (res.status === 422) {
        console.log(`indexnow: batch ${i + 1} rejected - key file at ${body.keyLocation} could not be verified (422)`);
      } else {
        console.log(`indexnow: batch ${i + 1} rejected (${res.status})`);
      }
    } catch (error) {
      console.log(`indexnow: batch ${i + 1} failed - ${error.message}`);
    }
  }
}

main();
