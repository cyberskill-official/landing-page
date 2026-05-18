import {
  defineField,
  defineType,
  EDITOR_GROUPS,
  featuredOrdering,
  featuredOrderField,
  imageWithAlt,
  localeField,
} from './shared';

export const testimonial = defineType({
  name: 'testimonial',
  type: 'document',
  title: 'Testimonial',
  groups: EDITOR_GROUPS,
  fields: [
    defineField({
      name: 'quote',
      type: 'blockContent',
      title: 'Quote',
      group: 'content',
      validation: (Rule) => Rule.required().min(50).max(500),
    }),
    defineField({
      name: 'author_name',
      type: 'string',
      title: 'Author name',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'author_role',
      type: 'string',
      title: 'Author role',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'author_company',
      type: 'string',
      title: 'Author company',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    imageWithAlt({ name: 'author_avatar', title: 'Author avatar' }),
    defineField({
      name: 'case_study_ref',
      type: 'reference',
      title: 'Case study reference',
      group: 'metadata',
      options: { weak: true },
      to: [{ type: 'case_study' }],
    }),
    featuredOrderField,
    localeField(),
  ],
  orderings: [featuredOrdering],
});
