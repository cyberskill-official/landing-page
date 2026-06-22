import type { MetadataRoute } from "next";
import { company } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? company.url;
  const paths = ["", "/work", "/careers"];
  const now = new Date();

  return paths.flatMap((p) => {
    const languages = { en: `${base}/en${p}`, vi: `${base}/vi${p}` };
    return [
      { url: `${base}/en${p}`, lastModified: now, alternates: { languages } },
      { url: `${base}/vi${p}`, lastModified: now, alternates: { languages } },
    ];
  });
}
