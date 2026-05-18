import { defineField, defineType, EDITOR_GROUPS, featuredOrdering, featuredOrderField, imageWithAlt, localeField } from './shared';

export const teamMember = defineType({
  name: 'team_member',
  type: 'document',
  title: 'Team Member',
  description: 'Privacy-gated public team profile. No contact fields, legal names, location, salary, or age.',
  groups: EDITOR_GROUPS,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Display name',
      description: 'Public display name. May be an alias or partial real name.',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'role',
      type: 'string',
      title: 'Role',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'bio',
      type: 'blockContent',
      title: 'Bio',
      description: 'Professional public bio only. No contact info, address, age, salary, or family details.',
      group: 'content',
    }),
    imageWithAlt({ name: 'avatar', title: 'Avatar' }),
    featuredOrderField,
    localeField(),
  ],
  orderings: [featuredOrdering],
});

