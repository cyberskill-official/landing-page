import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { team } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TeamJsonLd } from "@/components/seo/TeamJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/team");
}

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  // If no team members are configured, fallback to just showing the founder (first in array theoretically, or empty array handled gracefully)
  // But FR states "with no consented team member in config the route SHALL still render (the founder card alone, or an honest empty state) and SHALL NOT 404"
  // If array is empty, we show an honest empty state.

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            { name: locale === "vi" ? "Trang chủ" : "Home", path: `/${locale}` },
            { name: locale === "vi" ? "Đội ngũ" : "Team", path: `/${locale}/team` },
          ]}
        />
        <TeamJsonLd team={team} locale={locale} />
        
        <p className="cs-eyebrow">{dict.nav.team}</p>
        <h1>{locale === "vi" ? "Đội ngũ của chúng tôi" : "Our Team"}</h1>
        <p className="cs-section-lead">
          {locale === "vi"
            ? "Đội ngũ kỹ sư dày dặn kinh nghiệm, trực tiếp chịu trách nhiệm và đồng hành cùng dự án của bạn."
            : "Senior engineers who own the work end to end and stay with you from the first call to production."}
        </p>

        {team.length === 0 ? (
          <div className="cs-surface-light" style={{ padding: "var(--cs-space-xl)", textAlign: "center" }}>
            <p>{locale === "vi" ? "Đội ngũ đang được cập nhật." : "Our team profiles are being updated."}</p>
          </div>
        ) : (
          <div className="cs-grid" style={{ "--grid-cols": 3, gap: "var(--cs-space-xl)" } as React.CSSProperties}>
            {team.map((member) => (
              <article key={member.id} className="cs-surface-light" style={{ padding: "var(--cs-space-lg)", display: "flex", flexDirection: "column", gap: "var(--cs-space-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--cs-space-md)" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "var(--cs-color-surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : (
                      <span style={{ fontSize: "var(--cs-text-xl)", color: "var(--cs-color-text-dim)" }}>
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "var(--cs-text-lg)", margin: 0 }}>
                      {member.profileUrl ? (
                        <a href={member.profileUrl} target="_blank" rel="noopener noreferrer">
                          {member.name}
                        </a>
                      ) : (
                        member.name
                      )}
                    </h2>
                    <p className="cs-eyebrow" style={{ margin: 0 }}>{localize(member.role, locale)}</p>
                  </div>
                </div>
                <p style={{ margin: 0 }}>{localize(member.bio, locale)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
