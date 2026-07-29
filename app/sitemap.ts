import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content/site";

import { routeMetadata, hreflangAlternates } from "@/lib/content/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;

  return routeMetadata.flatMap((meta) => {
    const p = meta.route === "/" ? "" : meta.route;
    // TASK-SEO-023 §1.1-1.3: alternates come from the same helper the document
    // head uses, so every <url> carries en + vi + x-default and the two
    // hreflang declarations of a route agree. They did not before: the head
    // emitted three keys and the sitemap two, and Google discards an hreflang
    // set it cannot reconcile.
    const languages = hreflangAlternates(meta.route);
    const lastModified = new Date(meta.lastUpdated);
    return [
      { url: `${base}/en${p}`, lastModified, alternates: { languages } },
      { url: `${base}/vi${p}`, lastModified, alternates: { languages } },
    ];
  });
}
