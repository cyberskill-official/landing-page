import { getCaseStudyBySlug, getPublishedCaseStudySlugs } from '@/lib/case-studies';
import {
  allCaseStudySlugsQuery,
  caseStudyBySlugQuery,
  relatedCaseStudiesQuery,
  type SanityQuery,
} from './queries';
import type { OutcomeMetric, PortableTextBlock, SeoFields } from './types.generated';
import type { SanityPerspective } from './draft-mode';
import type { SupportedLocale } from '@/lib/metadata-helpers';

export type CaseStudyImage = {
  url: string;
  alt: string;
};

export type CaseStudyService = {
  _id: string;
  name: string;
  slug: string;
};

export type CaseStudyPageData = {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: string;
  client_name: string;
  client_logo?: CaseStudyImage;
  summary: string;
  body: PortableTextBlock[];
  hero_image: CaseStudyImage;
  gallery: CaseStudyImage[];
  outcome_metrics: OutcomeMetric[];
  services_used: CaseStudyService[];
  published_at: string;
  i18n_locale: SupportedLocale;
  seo?: Omit<SeoFields, 'og_image'> & { og_image?: CaseStudyImage };
};

type SanityFetchOptions = {
  params?: Record<string, unknown>;
  perspective?: SanityPerspective;
  tags?: string[];
};

const DEFAULT_UPDATED_AT = '2026-05-17T00:00:00.000Z';
const DEFAULT_PUBLISHED_AT = '2026-05-01T00:00:00.000Z';

function localeFromParams(params?: Record<string, unknown>): SupportedLocale {
  return params?.locale === 'vi' ? 'vi' : 'en';
}

function textBlock(text: string): PortableTextBlock {
  return {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
  };
}

async function fallbackCaseStudy(slug: string, locale: SupportedLocale): Promise<CaseStudyPageData | null> {
  const study = await getCaseStudyBySlug(slug);
  if (!study) return null;

  return {
    _id: `case-study.${study.slug}.${locale}`,
    _updatedAt: DEFAULT_UPDATED_AT,
    title: study.title[locale],
    slug: study.slug,
    client_name: study.client,
    summary: study.summary[locale],
    body: [
      textBlock(study.summary[locale]),
      textBlock(study.outcome[locale]),
      textBlock(locale === 'vi'
        ? 'Trang nay da san sang cho noi dung Sanity va giu duong fallback an toan.'
        : 'This route is ready for Sanity content while preserving a safe local fallback.'),
    ],
    hero_image: {
      url: '/storyboard/scene-3-capabilities.svg',
      alt: `${study.title[locale]} hero storyboard`,
    },
    gallery: [
      {
        url: '/storyboard/scene-1-origin.svg',
        alt: `${study.title[locale]} origin storyboard`,
      },
      {
        url: '/storyboard/scene-2-transformation.svg',
        alt: `${study.title[locale]} transformation storyboard`,
      },
    ],
    outcome_metrics: [
      { label: locale === 'vi' ? 'Pham vi' : 'Scope', value: 'Design + Engineering', delta_direction: 'neutral' },
      { label: locale === 'vi' ? 'Chat luong' : 'Quality', value: 'A11y-first', delta_direction: 'up' },
    ],
    services_used: [
      { _id: 'capability.design-systems', name: 'Design systems', slug: 'design-systems' },
      { _id: 'capability.web-engineering', name: 'Web engineering', slug: 'web-engineering' },
    ],
    published_at: DEFAULT_PUBLISHED_AT,
    i18n_locale: locale,
    seo: {
      meta_title: `${study.title[locale]} | CyberSkill`,
      meta_description: study.summary[locale],
      og_image: {
        url: '/storyboard/scene-3-capabilities.svg',
        alt: `${study.title[locale]} social preview`,
      },
    },
  };
}

export async function sanityFetch<T = unknown>(
  query: SanityQuery,
  options: SanityFetchOptions = {},
): Promise<T> {
  const locale = localeFromParams(options.params);

  if (query === allCaseStudySlugsQuery) {
    return getPublishedCaseStudySlugs().map((slug) => ({
      slug: { current: slug },
      i18n_locale: 'en',
    })) as T;
  }

  if (query === caseStudyBySlugQuery) {
    const slug = String(options.params?.slug ?? '');
    return fallbackCaseStudy(slug, locale) as T;
  }

  if (query === relatedCaseStudiesQuery) {
    const currentId = String(options.params?.id ?? '');
    const studies = await Promise.all(
      getPublishedCaseStudySlugs().map((slug) => fallbackCaseStudy(slug, locale)),
    );
    return studies
      .filter((study): study is CaseStudyPageData => study !== null)
      .filter((study) => study._id !== currentId)
      .slice(0, 3) as T;
  }

  throw new Error(`Unsupported Sanity query: ${query}`);
}
