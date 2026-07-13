import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content/site";

import { routeMetadata } from "@/lib/content/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;

  return routeMetadata.flatMap((meta) => {
    const p = meta.route === "/" ? "" : meta.route;
    const languages = { en: `${base}/en${p}`, vi: `${base}/vi${p}` };
    const lastModified = new Date(meta.lastUpdated);
    return [
      { url: `${base}/en${p}`, lastModified, alternates: { languages } },
      { url: `${base}/vi${p}`, lastModified, alternates: { languages } },
    ];
  });
}
