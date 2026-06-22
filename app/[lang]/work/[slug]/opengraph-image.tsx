import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n/config";
import { work } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";

export const alt = "CyberSkill case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-case-study social card (FR-SEO-008). The case title sits on the brand
// background so a shared link reads as that specific project, not the generic
// site card. System fonts only, so it builds offline like the root OG image.
export default async function CaseStudyOg({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const item = work.find((w) => w.slug === slug);
  const heading = item ? localize(item.title, locale) : locale === "vi" ? "Dự án" : "Work";
  const client = item ? item.client : "CyberSkill";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#45210E",
          color: "#FDF4E1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#F4BA17", letterSpacing: 6 }}>CYBERSKILL</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#E7D9C4", marginBottom: 16 }}>{client}</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.08 }}>{heading}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#E7D9C4" }}>
          {locale === "vi" ? "Câu chuyện dự án" : "Case study"}
        </div>
      </div>
    ),
    { ...size },
  );
}
