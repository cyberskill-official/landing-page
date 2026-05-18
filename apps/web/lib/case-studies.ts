import type { SupportedLocale } from './metadata-helpers';

export type LocalizedText = Record<SupportedLocale, string>;

export type CaseStudy = {
  client: string;
  outcome: LocalizedText;
  slug: string;
  summary: LocalizedText;
  title: LocalizedText;
  year: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'sample',
    client: 'CyberSkill Lab',
    year: '2026',
    title: {
      en: 'Design System Acceleration',
      vi: 'Tang toc he thong thiet ke',
    },
    summary: {
      en: 'A representative route shell for the upcoming Sanity-backed case-study renderer.',
      vi: 'Khung duong dan dai dien cho trinh hien thi case study dung Sanity sau nay.',
    },
    outcome: {
      en: 'Reusable tokens, typed component contracts, and accessibility guardrails.',
      vi: 'Token tai su dung, hop dong component co kieu, va hang rao accessibility.',
    },
  },
  {
    slug: 'museum-exhibit-acme',
    client: 'ACME Museum',
    year: '2026',
    title: {
      en: 'Interactive Exhibit Platform',
      vi: 'Nen tang trien lam tuong tac',
    },
    summary: {
      en: 'A stable sample slug used by SEO and performance route coverage.',
      vi: 'Slug mau on dinh dung cho kiem thu SEO va hieu nang.',
    },
    outcome: {
      en: 'Fast public storytelling with a motion-safe fallback path.',
      vi: 'Ke chuyen cong khai nhanh voi duong fallback an toan ve chuyen dong.',
    },
  },
];

export function getPublishedCaseStudySlugs() {
  return CASE_STUDIES.map((study) => study.slug);
}

export async function getCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((study) => study.slug === slug) ?? null;
}
