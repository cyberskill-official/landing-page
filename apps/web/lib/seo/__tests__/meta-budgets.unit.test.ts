import { describe, expect, test } from 'vitest';
import { DESCRIPTION_BUDGET, TITLE_BUDGET, truncateAtWord, validateMetadata } from '../meta-budgets';

describe('FR-SEO-005 metadata budgets', () => {
  test('validates title and description lengths', () => {
    expect(validateMetadata('CyberSkill — Work', 'Selected work.')).toEqual({ ok: true, errors: [] });
    expect(validateMetadata('x'.repeat(TITLE_BUDGET + 1), 'ok').ok).toBe(false);
    expect(validateMetadata('ok', 'x'.repeat(DESCRIPTION_BUDGET + 1)).ok).toBe(false);
  });

  test('truncates at a word boundary where possible', () => {
    expect(truncateAtWord('Hello world foo bar baz', 12)).toBe('Hello world…');
    expect(truncateAtWord('Verylongwordherexxxxxxxxxxxxxxx', 10)).toBe('Verylongwo…');
  });
});
