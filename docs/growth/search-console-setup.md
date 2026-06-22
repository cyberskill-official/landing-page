# Get cyberskill.world indexed: Google Search Console

The site already serves a correct `robots.txt` and a `sitemap.xml` listing the
en and vi pages with hreflang alternates. These steps register the site with
Google so it starts indexing, and submit the sitemap so discovery is fast.

## 1. Add the property

1. Go to search.google.com/search-console and sign in with the Google account
   that should own the property.
2. Add property, choose Domain (not URL prefix). Enter `cyberskill.world`.
3. Google shows a TXT record to add to DNS. Add it where the domain's DNS lives
   (the same place you added the Resend records). Save, then Verify. DNS can take
   a few minutes to propagate.

A Domain property covers https, www, and every subdomain in one, which is the
cleanest choice.

## 2. Submit the sitemap

1. In Search Console, open Sitemaps (left nav).
2. Enter `sitemap.xml` and Submit. The full URL is
   https://cyberskill.world/sitemap.xml.
3. Status should move to Success within a day; it lists the en and vi URLs.

## 3. Confirm indexing

1. Use the URL Inspection bar to check `https://cyberskill.world/en` and
   `https://cyberskill.world/vi` - request indexing for each to nudge the first
   crawl.
2. Over the next days, watch Pages and Performance for coverage and impressions.

## 4. Good follow-ups

- Set the international targeting if you want a market preference; the hreflang
  alternates already tell Google about en and vi.
- Add the same property to Bing Webmaster Tools (it can import from Search
  Console) for Bing and, increasingly, AI answer engines.
- Once insights content ships, resubmit the sitemap so new URLs are picked up.

Nothing here touches the codebase; it is account setup on Google's side.
