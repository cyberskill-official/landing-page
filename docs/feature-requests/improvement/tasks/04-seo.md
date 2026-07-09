# Epic 4 - search visibility

Goal: the site ranks for what buyers actually type, in both languages, and every page is a clean citation target. Foundations (hreflang, canonicals, sitemap, JSON-LD, OG) already exist; this epic makes them earn traffic.

---

### SEO-01 Intent title tags + localized VI metadata, sitewide
Wave 1 | owner: agent | effort: M | depends: none

Why: the title is slogan-only in both locales and the VI title is untranslated English; nobody searches the slogan.

Do:
1. In app/[lang]/layout.tsx and every page's generateMetadata: unique, intent-carrying titles and descriptions per route and locale. Home EN "CyberSkill | Software development company in Ho Chi Minh City - web, mobile, internal systems"; home VI "CyberSkill | Công ty phát triển phần mềm tại TP.HCM - web, di động, hệ thống nội bộ". Services, work index, work slugs, careers, how-we-build each get their own pair.
2. Keep the slogan in the OG title if desired for shares; the plain title carries the keywords.
3. Titles 50-60 characters where possible; descriptions 140-160 with one concrete proof point.
4. Update tests/snapshots if metadata is asserted anywhere.

Done when: every indexable route has unique localized title + description; gates green.

---

### SEO-02 Deepen the three service pages
Wave 3 | owner: mixed | effort: L | depends: CONV-06 (price signals)

Do (agent): expand each /services/[slug] to a full page: who it is for, scope of what we take on, typical stack, the four-step process applied to this practice, typical timeline and starting range (from CONV-06), 4-6 service-specific FAQ entries (with FAQPage JSON-LD), and links to related work. Draft EN, then VI, marked FOR REVIEW.
Stephen does: review claims and ranges.

Done when: each service page exceeds roughly 800 words of real content per locale, has its own FAQ block, and links to work; gates green.

---

### SEO-03 /notes content engine
Wave 3 | owner: mixed | effort: L | depends: none

Why: the durable channel: long-tail queries, newsletter fuel, GEO citations, and a reason to return.

Do (agent):
1. Add a /notes route group ([lang]/notes + [lang]/notes/[slug]) reading MDX or a typed content module; listing page, post layout (title, author, published + updated dates, TLDR block per GEO-04), tags.
2. RSS/Atom feed at /notes/feed.xml (per locale or combined with language tags).
3. Sitemap + metadata + OG images wired for posts.
4. Seed with two posts drafted from existing material: "How we build: the gates we refuse to ship without" and "A 15-point teardown: how we review a website before we quote it" (feeds NURT-08). Mark FOR REVIEW.
Stephen does: review and publish; commit to two posts per month afterward.

Done when: listing, two reviewed posts, and feed are live in EN (VI where translated); budgets hold; gates green.

---

### SEO-04 Real per-page lastModified dates in sitemap
Wave 2 | owner: agent | effort: S | depends: none

Why: app/sitemap.ts stamps new Date() on every build; fake freshness teaches crawlers to ignore the signal.

Do: add a lastUpdated field per entry in lib/content/site.ts (services, work, static pages) and use it in the sitemap; posts use their real dates. Fallback to a fixed site-launch date, never build time.

Done when: sitemap emits stable dates that only change when content changes; gates green.

---

### SEO-05 Breadcrumb JSON-LD
Wave 2 | owner: agent | effort: S | depends: none

Do: add BreadcrumbList JSON-LD to /services/[slug] and /work/[slug] (Home > Work > Title), localized names, matching visible breadcrumbs optional. Validate with the Rich Results test.

Done when: both detail templates emit valid breadcrumbs in both locales; gates green.

---

### SEO-06 OG images for services + careers
Wave 2 | owner: agent | effort: S | depends: none

Do: add opengraph-image.tsx for [lang]/services/[slug] and [lang]/careers reusing the existing Satori template style (home and work slugs already have them). Keep each render under the image budget.

Done when: unique OG cards render for those routes; verified via the OG debugger or raw fetch; gates green.

---

### SEO-07 Search Console + Bing setup
Wave 1 | owner: human | effort: S | depends: none

Do: verify cyberskill.world in Google Search Console (DNS TXT preferred) and Bing Webmaster Tools (imports from GSC); submit the sitemap; check the indexing report for /en and /vi; confirm no surprises (the /lite route is noindex by design).

Done when: both consoles verified, sitemap submitted, first indexing report reviewed and noted in the ledger.

---

### SEO-08 Backlink base: listicle inclusion + local press
Wave 3 | owner: mixed | effort: M | depends: PROOF-07

Agent does: build the target list (the "top software companies in Vietnam" articles that already rank, Vietnam tech press, community sites), each with author or contact and a one-line pitch angle; draft the inclusion pitch email (EN/VI). Save under docs/improvement/assets/outreach/.
Stephen does: send pitches; offer a story (founder journey, the Lumi build, the CyberOS platform) to local press when timing fits.

Done when: list + drafts exist; at least five pitches sent; results logged.

---

### SEO-09 Kinetic heading crawler-text fix
Wave 2 | owner: agent | effort: S | depends: none

Why: extracted text reads "TurnYourWillIntoReal" and "Thearcofawish" because word spans carry no whitespace between them. aria-label covers screen readers; crawlers that ignore ARIA still see concatenated strings.

Do: in components/motion/KineticText.tsx, ensure real whitespace exists between word spans (a space text node or an sr-only span between words), or render an sr-only plain-text copy alongside the aria-hidden visual spans. Verify by fetching the rendered HTML and checking the extracted heading contains spaces; keep visual output identical.

Done when: raw-HTML extraction shows correctly spaced headings, visual diff unchanged, a11y checks pass, gates green.
