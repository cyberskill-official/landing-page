import type { TeamMember } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/config";
import { company, siteUrl } from "@/lib/content/site";

export function TeamJsonLd({ team, locale }: { team: TeamMember[]; locale: Locale }) {
  if (team.length === 0) return null;

  const jsonLd = team.map((member) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/${locale}/team#${member.id}`,
    name: member.name,
    jobTitle: localize(member.role, locale),
    description: localize(member.bio, locale),
    url: member.profileUrl,
    image: member.photoUrl,
    worksFor: {
      "@id": `${siteUrl}/#organization`,
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
