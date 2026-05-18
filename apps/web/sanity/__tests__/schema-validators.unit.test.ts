import { describe, expect, test } from 'vitest';
import { resolveSanityPerspective } from '../../lib/sanity/draft-mode';
import { isPubliclyVisible, PUBLIC_SANITY_FILTER } from '../../lib/sanity/publication';
import { canDeleteDocument, TEAM_MEMBER_FORBIDDEN_FIELDS } from '../policies';
import { documentSchemas, schemaTypes } from '../schemas';
import type { FieldDefinition, TypeDefinition } from '../schemas/shared';

function fieldNames(schema: TypeDefinition): string[] {
  return schema.fields?.map((field) => field.name) ?? [];
}

function findField(schema: TypeDefinition, name: string): FieldDefinition | undefined {
  return schema.fields?.find((field) => field.name === name);
}

function collectImageFields(fields: readonly FieldDefinition[] = []): FieldDefinition[] {
  return fields.flatMap((field) => {
    const nestedFields = collectImageFields(field.fields ?? []);
    const arrayFields = field.of?.flatMap((item) => collectImageFields(item.fields ?? [])) ?? [];
    return field.type === 'image' ? [field, ...nestedFields, ...arrayFields] : [...nestedFields, ...arrayFields];
  });
}

describe('FR-CMS-004 Sanity schema', () => {
  test('exports the five required CMS document types plus block content support', () => {
    expect(documentSchemas.map((schema) => schema.name)).toEqual([
      'case_study',
      'testimonial',
      'capability',
      'team_member',
      'job',
    ]);
    expect(schemaTypes.some((schema) => schema.name === 'blockContent')).toBe(true);
  });

  test('adds locale fields and editor groups to every document type', () => {
    for (const schema of documentSchemas) {
      expect(schema.groups?.map((group) => group.name)).toEqual([
        'content',
        'metadata',
        'seo',
        'i18n',
        'workflow',
      ]);

      const locale = findField(schema, 'i18n_locale');
      expect(locale?.type).toBe('string');
      expect(locale?.initialValue).toBe('en');
      expect(locale?.options).toEqual({
        list: [
          { title: 'English', value: 'en' },
          { title: 'Vietnamese', value: 'vi' },
        ],
      });
    }
  });

  test('keeps routing slugs on case studies and jobs', () => {
    const caseStudy = documentSchemas.find((schema) => schema.name === 'case_study');
    const job = documentSchemas.find((schema) => schema.name === 'job');

    expect(findField(caseStudy!, 'slug')?.type).toBe('slug');
    expect(findField(job!, 'slug')?.type).toBe('slug');
  });

  test('requires alt text metadata for every image field', () => {
    for (const schema of documentSchemas) {
      for (const imageField of collectImageFields(schema.fields)) {
        expect(imageField.options).toEqual(expect.objectContaining({ hotspot: true }));
        expect(imageField.fields?.some((field) => field.name === 'alt' && field.type === 'string')).toBe(true);
      }
    }
  });

  test('omits forbidden PII fields from TeamMember', () => {
    const teamMember = documentSchemas.find((schema) => schema.name === 'team_member')!;
    const names = fieldNames(teamMember);

    for (const forbiddenField of TEAM_MEMBER_FORBIDDEN_FIELDS) {
      expect(names).not.toContain(forbiddenField);
    }
  });

  test('locks document deletion to approved roles', () => {
    expect(canDeleteDocument(['editor'])).toBe(false);
    expect(canDeleteDocument(['editor', 'content-lead'])).toBe(true);
    expect(canDeleteDocument(['administrator'])).toBe(true);
  });

  test('supports scheduled publish and draft preview rules', () => {
    const now = new Date('2026-05-17T12:00:00.000Z');

    expect(PUBLIC_SANITY_FILTER).toContain('published_at <= now()');
    expect(isPubliclyVisible({ _id: 'case-1', published_at: '2026-05-17T11:00:00.000Z' }, now)).toBe(true);
    expect(isPubliclyVisible({ _id: 'case-1', published_at: '2026-05-18T11:00:00.000Z' }, now)).toBe(false);
    expect(isPubliclyVisible({ _id: 'drafts.case-1', published_at: '2026-05-17T11:00:00.000Z' }, now)).toBe(false);
    expect(resolveSanityPerspective({ draftModeEnabled: true, hasReadToken: true })).toBe('previewDrafts');
    expect(resolveSanityPerspective({ draftModeEnabled: true, hasReadToken: false })).toBe('published');
  });
});

