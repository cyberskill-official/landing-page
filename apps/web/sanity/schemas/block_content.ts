import { defineType } from './shared';

export const blockContent = defineType({
  name: 'blockContent',
  type: 'array',
  title: 'Portable text',
  of: [{ type: 'block' }],
});

