import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n/config";
import { work } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";

export const alt = "CyberSkill case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-case-study social card (TASK-SEO-008). The case title sits on the brand
// background so a shared link reads as that specific project, not the generic
// site card. System fonts only, so it builds offline like the root OG image.
export default async function CaseStudyOg({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const item = work.find((w) => w.slug === slug);
  const heading = item ? localize(item.title, locale) : locale === "vi" ? "Dự án" : "Work";
  const client = item ? localize(item.client, locale) : "CyberSkill";

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
          backgroundColor: "#3A1C0B",
          backgroundImage:
            "radial-gradient(900px 520px at 14% 108%, rgba(244,186,23,0.34), rgba(58,28,11,0) 60%), linear-gradient(135deg, #5A2E12, #2A1408)",
          color: "#FDF4E1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#F4BA17", letterSpacing: 6 }}>CYBERSKILL</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#E7D9C4", marginBottom: 16 }}>{client}</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.08 }}>{heading}</div>
          <div style={{ display: "flex", width: 120, height: 6, marginTop: 28, background: "#F4BA17", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#E7D9C4" }}>
          {locale === "vi" ? "Câu chuyện dự án" : "Case study"}
        </div>
      </div>
    ),
    { ...size },
  );
}
