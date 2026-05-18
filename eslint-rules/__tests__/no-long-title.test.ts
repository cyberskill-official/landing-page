import { describe, expect, test } from 'vitest';
import { findLongTitleLiterals } from '../no-long-title';

describe('FR-SEO-005 no-long-title rule', () => {
  test('flags metadata titles over 60 characters', () => {
    expect(findLongTitleLiterals(`const metadata = { title: '${'x'.repeat(61)}' };`)).toHaveLength(1);
  });

  test('allows titles within budget', () => {
    expect(findLongTitleLiterals("const metadata = { title: 'CyberSkill — Work' };")).toEqual([]);
  });
});
