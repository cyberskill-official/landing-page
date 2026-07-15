---
id: NFR-I18N-001
category: Internationalization
priority: MUST
status: enforced
owner: Stephen Cheng
created: 2026-06-22
---

## Requirement

The site is Vietnamese-first and fully bilingual. Every UI string has an English
and a Vietnamese value. Each locale is its own crawlable URL with hreflang
alternates, and `<html lang>` matches the content being served.

## Verification

`lib/i18n/dictionaries.ts` carries both locales for every key (TASK-CMS-001).
Middleware sets the per-locale `<html lang>` via the locale request header
(TASK-WEB-001). The sitemap and per-route metadata emit hreflang alternates
(TASK-SEO-001).

## Current status

Both locales resolve for every key, the lang attribute tracks the active locale,
and hreflang is emitted. A native-Vietnamese copy proofread is deferred to
Stephen.
