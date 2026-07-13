---
id: FR-OPS-017
title: "Expose static CDN Cache-Control headers on sitemaps, feeds, and LLM text routes"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [FR-OPS-005, FR-SEO-017]
routed_back_count: 0
awh: N/A
---

# FR-OPS-017: Expose static CDN Cache-Control headers on sitemaps, feeds, and LLM text routes

## 0. Why (evidence)
To optimize serverless execution costs and prevent high-frequency crawler queries on static xml/txt routes from exhausting computing resources. Setting explicit cache-control directives allows edge CDNs to cache responses safely and invalidate them gracefully.

## 1. Description (normative)
- 1.1 All dynamic XML sitemaps and RSS feeds SHALL return a `Cache-Control` header allowing public caching for at least 24 hours.
- 1.2 The AI helper text endpoints (`/llms.txt` and `/llms-full.txt`) SHALL return Cache-Control headers allowing public caching.
- 1.3 The routes SHALL implement stale-while-revalidate patterns (`s-maxage=86400, stale-while-revalidate=3600`) so CDNs update cache in the background.

## 2. Acceptance criteria
- [ ] AC for 1.1 - GET requests to sitemaps and feeds return Cache-Control with public s-maxage - test: `perf/xml-cache-headers`
- [ ] AC for 1.2 - GET requests to /llms.txt and /llms-full.txt return Cache-Control with public s-maxage - test: `perf/llms-cache-headers`
- [ ] AC for 1.3 - CDN caching behaves as stale-while-revalidate in live staging checks - test: `perf/cdn-cache-validation`

## 3. Edge cases
- Deployments updating the sitemap, but CDNs serving stale content to search engines past the 24-hour window.
- Private headers accidentally leaking into public cache spaces.

## 4. Out of scope
- Caching policies for dynamic user API routes (`/api/lead` or `/api/genie`).

## 5. Protected invariants
- Cached sitemaps and feeds must always match their language-specific alternates.
