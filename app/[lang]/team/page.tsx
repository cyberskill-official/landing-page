import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localize } from "@/lib/i18n/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TeamJsonLd } from "@/components/seo/TeamJsonLd";
import { resolveMetadata } from "@/lib/content/metadata";
import { getPublishableContent } from "@/lib/content/read-model";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/team");
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  // TASK-OPS-019 scaffold: single read-model entry (git today, CyberOS later)
  const { team, aboutStory, aboutCulture } = getPublishableContent();

  return (
    <section className="cs-section" suppressHydrationWarning data-about-team="">
      <div className="cs-container">
        <BreadcrumbJsonLd
          items={[
            {
              name: locale === "vi" ? "Trang chủ" : "Home",
              path: `/${locale}`,
            },
            {
              name: locale === "vi" ? "Đội ngũ" : "Team",
              path: `/${locale}/team`,
            },
          ]}
        />
        <TeamJsonLd team={team} locale={locale} />

        <p className="cs-eyebrow">{dict.nav.team}</p>
        <h1>{locale === "vi" ? "Đội ngũ của chúng tôi" : "Our Team"}</h1>

        {/* TASK-CMS-006 §1.1: company story from content module */}
        <div data-about-story="" style={{ maxWidth: "40rem", marginBottom: "var(--cs-space-xl)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
            {localize(aboutStory.title, locale)}
          </h2>
          <p className="cs-section-lead">{localize(aboutStory.body, locale)}</p>
        </div>

        {/* TASK-CMS-006 §1.1 culture */}
        <div data-about-culture="" style={{ marginBottom: "var(--cs-space-xl)" }}>
          <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
            {localize(aboutCulture.title, locale)}
          </h2>
          <ul className="cs-service-outcomes" role="list">
            {aboutCulture.points.map((p, i) => (
              <li key={i}>{localize(p, locale)}</li>
            ))}
          </ul>
        </div>

        <h2 style={{ fontSize: "var(--cs-text-xl)" }}>
          {locale === "vi" ? "Con người" : "People"}
        </h2>
        <p className="cs-section-lead">
          {locale === "vi"
            ? "Chỉ những thành viên đã đồng ý bằng văn bản mới xuất hiện ở đây."
            : "Only people with recorded written consent appear here."}
        </p>

        {team.length === 0 ? (
          <div
            className="cs-surface-light"
            style={{ padding: "var(--cs-space-xl)", textAlign: "center" }}
            data-team-empty=""
          >
            <p>
              {locale === "vi"
                ? "Đội ngũ đang được cập nhật."
                : "Our team profiles are being updated."}
            </p>
          </div>
        ) : (
          <div
            className="cs-grid"
            style={
              {
                "--grid-cols": 3,
                gap: "var(--cs-space-xl)",
              } as CSSProperties
            }
            data-team-grid=""
          >
            {team.map((member) => (
              <article
                key={member.id}
                className="cs-surface-light"
                data-team-member={member.id}
                data-consent-id={member.consentId}
                style={{
                  padding: "var(--cs-space-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--cs-space-md)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--cs-space-md)",
                  }}
                >
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
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "var(--cs-text-xl)",
                          color: "var(--cs-color-text-dim)",
                        }}
                      >
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "var(--cs-text-lg)", margin: 0 }}>
                      {member.profileUrl ? (
                        <a
                          href={member.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {member.name}
                        </a>
                      ) : (
                        member.name
                      )}
                    </h3>
                    <p className="cs-eyebrow" style={{ margin: 0 }}>
                      {localize(member.role, locale)}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0 }}>{localize(member.bio, locale)}</p>
                {member.quote ? (
                  <blockquote data-field="quote" style={{ margin: 0 }}>
                    {localize(member.quote, locale)}
                  </blockquote>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {/* TASK-CMS-006 §1.5: recruiting surface without hardcoded job copy */}
        <p style={{ marginTop: "var(--cs-space-xl)" }} data-careers-link="">
          <a href={`/${locale}/careers`}>{dict.sections.careersCta}</a>
        </p>
      </div>
    </section>
  );
}
