import {
  defineField,
  defineType,
  EDITOR_GROUPS,
  featuredOrdering,
  featuredOrderField,
  imageWithAlt,
  localeField,
  newestOrdering,
  publishedAtField,
  seoField,
} from './shared';

export const caseStudy = defineType({
  name: 'case_study',
  type: 'document',
  title: 'Case Study',
  groups: EDITOR_GROUPS,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      group: 'content',
      validation: (Rule) => Rule.required().min(10).max(120),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'metadata',
      options: { source: 'title', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client_name',
      type: 'string',
      title: 'Client name',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    imageWithAlt({ name: 'client_logo', title: 'Client logo' }),
    defineField({
      name: 'summary',
      type: 'blockContent',
      title: 'Summary',
      group: 'content',
      validation: (Rule) => Rule.required().min(50).max(300),
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Body',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    imageWithAlt({ name: 'hero_image', title: 'Hero image', required: true }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Gallery',
      group: 'content',
      of: [imageWithAlt({ name: 'gallery_image', title: 'Gallery image' })],
      validation: (Rule) => Rule.max(12),
    }),
    defineField({
      name: 'outcome_metrics',
      type: 'array',
      title: 'Outcome metrics',
      group: 'metadata',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'delta_direction',
              type: 'string',
              options: { list: ['up', 'down', 'neutral'] },
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'services_used',
      type: 'array',
      title: 'Services used',
      group: 'metadata',
      of: [{ type: 'reference', to: [{ type: 'capability' }] }],
    }),
    publishedAtField,
    featuredOrderField,
    localeField(),
    seoField,
  ],
  orderings: [featuredOrdering, newestOrdering],
  preview: {
    select: { title: 'title', subtitle: 'client_name', locale: 'i18n_locale' },
    prepare: ({ title, subtitle, locale }) => ({
      title,
      subtitle: `${subtitle ?? 'No client'} - ${locale ?? 'en'}`,
    }),
  },
});

