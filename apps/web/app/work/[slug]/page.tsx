import type { Metadata } from 'next';
import React from 'react';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { CaseStudyBody } from '@/components/cms/CaseStudyBody';
import { CaseStudyHero } from '@/components/cms/CaseStudyHero';
import { GalleryStrip } from '@/components/cms/GalleryStrip';
import { OutcomeMetricsGrid } from '@/components/cms/OutcomeMetricsGrid';
import { RelatedCaseStudies } from '@/components/cms/RelatedCaseStudies';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import { buildOpenGraphTwitterMeta } from '@/lib/seo/og-image-helpers';
import { resolveSanityPerspective } from '@/lib/sanity/draft-mode';
import {
  allCaseStudySlugsQuery,
  caseStudyBySlugQuery,
  relatedCaseStudiesQuery,
} from '@/lib/sanity/queries';
import { sanityFetch, type CaseStudyPageData } from '@/lib/sanity/sanity-fetch';
import { computeReadingTime } from '@/lib/util/reading-time';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await sanityFetch<Array<{ slug: { current: string } }>>(allCaseStudySlugsQuery);
  return slugs.map((item) => ({ slug: item.slug.current }));
}

export async function generateMetadata({ params, searchParams }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveRouteLocale(searchParams);
  const study = await sanityFetch<CaseStudyPageData | null>(caseStudyBySlugQuery, {
    params: { slug, locale },
    tags: [`case_study:${slug}`],
  });

  if (!study) {
    return generateRouteMetadata(`/work/${slug}`, {
      title: 'CyberSkill — Case Study Not Found',
      description: 'The requested CyberSkill case study is not published.',
    });
  }

  const title = study.seo?.meta_title ?? `${study.title} | CyberSkill`;
  const description = study.seo?.meta_description ?? study.summary;
  const image = study.seo?.og_image?.url ?? `/work/${slug}/opengraph-image`;

  return {
    ...generateRouteMetadata(`/work/${slug}`, {
      title,
      description,
      hreflang: {
        'x-default': `/work/${slug}`,
        en: `/work/${slug}`,
        vi: `/vi/work/${slug}`,
      },
    }),
    openGraph: {
      ...buildOpenGraphTwitterMeta({
        title,
        description,
        path: `/work/${slug}`,
        locale,
        imagePath: image,
        imageAlt: `${study.title} CyberSkill case study preview`,
        type: 'article',
      }).openGraph,
    },
    twitter: {
      ...buildOpenGraphTwitterMeta({
        title,
        description,
        path: `/work/${slug}`,
        locale,
        imagePath: image,
        imageAlt: `${study.title} CyberSkill case study preview`,
        type: 'article',
      }).twitter,
    },
  };
}

export default async function WorkPage({ params, searchParams }: WorkPageProps) {
  const { slug } = await params;
  const [locale, draft] = await Promise.all([resolveRouteLocale(searchParams), draftMode()]);
  const perspective = resolveSanityPerspective({
    draftModeEnabled: draft.isEnabled,
    hasReadToken: Boolean(process.env.SANITY_API_READ_TOKEN),
  });

  const study = await sanityFetch<CaseStudyPageData | null>(caseStudyBySlugQuery, {
    params: { slug, locale },
    tags: [`case_study:${slug}`],
    perspective,
  });

  if (!study) notFound();

  const related = await sanityFetch<CaseStudyPageData[]>(relatedCaseStudiesQuery, {
    params: {
      id: study._id,
      locale,
      services_used_ids: study.services_used.map((service) => service._id),
    },
    tags: ['case_study:related'],
  });
  const readingMinutes = computeReadingTime(study.body);

  return (
    <main className="route-page route-page--work">
      <article aria-labelledby="case-study-title" className="case-study-article">
        <ArticleJsonLd
          title={study.title}
          image={study.hero_image.url}
          datePublished={study.published_at}
          description={study.summary}
        />
        <a href="/work" className="case-study-back">Back to all work</a>
        <CaseStudyHero
          title={study.title}
          clientName={study.client_name}
          heroImage={study.hero_image}
          summary={study.summary}
        />
        <p className="case-study-meta">~{readingMinutes} min read</p>
        <CaseStudyBody body={study.body} />
        <OutcomeMetricsGrid metrics={study.outcome_metrics} />
        <GalleryStrip images={study.gallery} />
        <RelatedCaseStudies items={related} />
        <p className="case-study-meta">
          Last updated: {new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(new Date(study._updatedAt))}
        </p>
        <a href="/work" className="case-study-back">Back to all work</a>
        <a href="/#cta-hub" className="case-study-cta">Start a project</a>
      </article>
    </main>
  );
}
