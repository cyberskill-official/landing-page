export type SanityLocale = 'en' | 'vi';

export type SanityReference<TType extends string = string> = {
  _type: 'reference';
  _ref: string;
  _weak?: boolean;
  _targetType?: TType;
};

export type SanityImageWithAlt = {
  _type: 'image';
  asset?: SanityReference<'sanity.imageAsset'>;
  alt: string;
  crop?: Record<string, unknown>;
  hotspot?: Record<string, unknown>;
};

export type PortableTextBlock = {
  _type: 'block';
  children?: Array<{ _type: 'span'; text: string; marks?: string[] }>;
  markDefs?: unknown[];
  style?: string;
};

export type SeoFields = {
  meta_title?: string;
  meta_description?: string;
  og_image?: SanityImageWithAlt;
};

export type OutcomeMetric = {
  label: string;
  value: string;
  delta_direction: 'up' | 'down' | 'neutral';
};

export type CaseStudy = {
  _id: string;
  _type: 'case_study';
  title: string;
  slug: { current: string };
  client_name: string;
  client_logo?: SanityImageWithAlt;
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
  hero_image: SanityImageWithAlt;
  gallery?: SanityImageWithAlt[];
  outcome_metrics?: OutcomeMetric[];
  services_used?: Array<SanityReference<'capability'>>;
  published_at?: string;
  featured_order?: number;
  i18n_locale: SanityLocale;
  seo?: SeoFields;
};

export type Testimonial = {
  _id: string;
  _type: 'testimonial';
  quote: PortableTextBlock[];
  author_name: string;
  author_role: string;
  author_company: string;
  author_avatar?: SanityImageWithAlt;
  case_study_ref?: SanityReference<'case_study'>;
  featured_order?: number;
  i18n_locale: SanityLocale;
};

export type Capability = {
  _id: string;
  _type: 'capability';
  name: string;
  slug: { current: string };
  description: PortableTextBlock[];
  icon?: SanityImageWithAlt;
  parent_category: 'design' | 'engineering' | 'ops' | 'research';
  featured_order?: number;
  i18n_locale: SanityLocale;
};

export type TeamMember = {
  _id: string;
  _type: 'team_member';
  name: string;
  role: string;
  bio?: PortableTextBlock[];
  avatar?: SanityImageWithAlt;
  featured_order?: number;
  i18n_locale: SanityLocale;
};

export type Job = {
  _id: string;
  _type: 'job';
  title: string;
  slug: { current: string };
  department: 'engineering' | 'design' | 'ops' | 'growth';
  level: 'junior' | 'mid' | 'senior' | 'principal';
  location_type: 'remote' | 'hybrid' | 'hcmc-on-site';
  summary: PortableTextBlock[];
  description: PortableTextBlock[];
  ats_external_id?: string;
  social_image?: SanityImageWithAlt;
  published_at?: string;
  closed_at?: string;
  i18n_locale: SanityLocale;
};

export type CmsDocument = CaseStudy | Testimonial | Capability | TeamMember | Job;

