import { defineField, defineType, EDITOR_GROUPS, featuredOrdering, featuredOrderField, imageWithAlt, localeField } from './shared';

export const capability = defineType({
  name: 'capability',
  type: 'document',
  title: 'Capability',
  groups: EDITOR_GROUPS,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'metadata',
      options: { source: 'name', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'blockContent',
      title: 'Description',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    imageWithAlt({ name: 'icon', title: 'Icon' }),
    defineField({
      name: 'parent_category',
      type: 'string',
      title: 'Parent category',
      group: 'metadata',
      options: { list: ['design', 'engineering', 'ops', 'research'] },
      validation: (Rule) => Rule.required(),
    }),
    featuredOrderField,
    localeField(),
  ],
  orderings: [featuredOrdering],
});

