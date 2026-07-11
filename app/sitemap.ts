import type { MetadataRoute } from "next";
import { services, work, siteUrl } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const paths = [
    "",
    "/work",
    "/careers",
    "/how-we-build",
    // App-store legal pages for CyberOS. Google Play requires the account
    // deletion URL to be "easily discoverable", so both are indexable and
    // sitemapped rather than orphan pages reachable only from the store entry.
    "/cyberos/privacy",
    "/cyberos/delete-account",
    "/cyberos/content-policy",
    ...services.map((s) => `/services/${s.id}`),
    ...work.map((w) => `/work/${w.slug}`),
  ];
  const now = new Date();

  return paths.flatMap((p) => {
    const languages = { en: `${base}/en${p}`, vi: `${base}/vi${p}` };
    return [
      { url: `${base}/en${p}`, lastModified: now, alternates: { languages } },
      { url: `${base}/vi${p}`, lastModified: now, alternates: { languages } },
    ];
  });
}
