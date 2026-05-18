export const caseStudyBySlugQuery = 'caseStudyBySlug';
export const allCaseStudySlugsQuery = 'allCaseStudySlugs';
export const relatedCaseStudiesQuery = 'relatedCaseStudies';

export type SanityQuery =
  | typeof caseStudyBySlugQuery
  | typeof allCaseStudySlugsQuery
  | typeof relatedCaseStudiesQuery;

