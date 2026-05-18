import type { Metadata } from 'next';
import { getCaseStudyBySlug, getPublishedCaseStudySlugs } from '@/lib/case-studies';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import type { CaseStudy } from '@/lib/case-studies';

type WorkIndexPageProps = {
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/work', {
    title: 'CyberSkill — Work',
    description: 'Selected CyberSkill software and design system case studies.',
    hreflang: {
      'x-default': '/work',
      en: '/work',
      vi: '/vi/work',
    },
  });
}

export default async function WorkIndexPage({ searchParams }: WorkIndexPageProps) {
  const locale = await resolveRouteLocale(searchParams);
  const studies = (await Promise.all(getPublishedCaseStudySlugs().map((slug) => getCaseStudyBySlug(slug))))
    .filter((study): study is CaseStudy => study !== null);

  return (
    <main className="route-page">
      <p className="route-kicker">Work</p>
      <h1>{locale === 'vi' ? 'Du an' : 'Selected work'}</h1>
      {studies.map((study) => (
        <p key={study.slug}>
          <a href={`/work/${study.slug}`}>{study.title[locale]}</a>
          {' '}
          <span>{study.summary[locale]}</span>
        </p>
      ))}
    </main>
  );
}
