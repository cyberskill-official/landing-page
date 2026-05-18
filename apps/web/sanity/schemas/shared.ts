export type Locale = 'en' | 'vi';

export type SchemaGroupName = 'content' | 'metadata' | 'seo' | 'i18n' | 'workflow';

export type ValidationRule = {
  required: () => ValidationRule;
  min: (value: number) => ValidationRule;
  max: (value: number) => ValidationRule;
  custom: (validator: (value: unknown) => true | string) => ValidationRule;
};

export type FieldDefinition = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  group?: SchemaGroupName;
  initialValue?: unknown;
  fields?: FieldDefinition[];
  to?: Array<{ type: string }>;
  of?: Array<FieldDefinition | { type: string; to?: Array<{ type: string }>; fields?: FieldDefinition[]; options?: unknown }>;
  options?: unknown;
  validation?: (Rule: ValidationRule) => ValidationRule;
};

export type TypeDefinition = {
  name: string;
  type: string;
  title: string;
  description?: string;
  groups?: Array<{ name: SchemaGroupName; title: string; default?: boolean }>;
  fields?: FieldDefinition[];
  of?: Array<{ type: string }>;
  orderings?: Array<{
    title: string;
    name: string;
    by: Array<{ field: string; direction: 'asc' | 'desc' }>;
  }>;
  preview?: {
    select: Record<string, string>;
    prepare?: (selection: Record<string, unknown>) => Record<string, unknown>;
  };
};

export function defineField<T extends FieldDefinition>(field: T): T {
  return field;
}

export function defineType<T extends TypeDefinition>(type: T): T {
  return type;
}

export const EDITOR_GROUPS = [
  { name: 'content', title: 'Content', default: true },
  { name: 'metadata', title: 'Metadata' },
  { name: 'seo', title: 'SEO' },
  { name: 'i18n', title: 'Internationalization' },
  { name: 'workflow', title: 'Workflow' },
] satisfies TypeDefinition['groups'];

export const LOCALE_OPTIONS = [
  { title: 'English', value: 'en' },
  { title: 'Vietnamese', value: 'vi' },
] as const;

export function localeField(group: SchemaGroupName = 'i18n') {
  return defineField({
    name: 'i18n_locale',
    type: 'string',
    title: 'Locale',
    group,
    initialValue: 'en' satisfies Locale,
    options: { list: LOCALE_OPTIONS },
    validation: (Rule) => Rule.required(),
  });
}

export function imageWithAlt({
  name,
  title,
  group = 'content',
  required = false,
}: {
  name: string;
  title: string;
  group?: SchemaGroupName;
  required?: boolean;
}) {
  return defineField({
    name,
    type: 'image',
    title,
    group,
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        type: 'string',
        title: 'Alt text',
        validation: (Rule) => Rule.required().min(4).max(160),
      }),
    ],
    validation: required ? (Rule) => Rule.required() : undefined,
  });
}

export const featuredOrderField = defineField({
  name: 'featured_order',
  type: 'number',
  title: 'Featured order',
  group: 'metadata',
});

export const publishedAtField = defineField({
  name: 'published_at',
  type: 'datetime',
  title: 'Published at',
  description: 'Future dates are hidden from public queries until the timestamp passes.',
  group: 'workflow',
});

export const seoField = defineField({
  name: 'seo',
  type: 'object',
  title: 'SEO',
  group: 'seo',
  fields: [
    defineField({
      name: 'meta_title',
      type: 'string',
      title: 'Meta title',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'meta_description',
      type: 'string',
      title: 'Meta description',
      validation: (Rule) => Rule.max(158),
    }),
    imageWithAlt({ name: 'og_image', title: 'OpenGraph image', group: 'seo' }),
  ],
});

export const featuredOrdering = {
  title: 'Featured order',
  name: 'featured_order',
  by: [
    { field: 'featured_order', direction: 'asc' },
    { field: 'published_at', direction: 'desc' },
  ],
} satisfies NonNullable<TypeDefinition['orderings']>[number];

export const newestOrdering = {
  title: 'Newest first',
  name: 'published_desc',
  by: [{ field: 'published_at', direction: 'desc' }],
} satisfies NonNullable<TypeDefinition['orderings']>[number];
