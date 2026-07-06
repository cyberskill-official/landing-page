import type { MetadataRoute } from "next";
import { services, work, siteUrl } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const paths = [
    "",
    "/work",
    "/careers",
    "/how-we-build",
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
