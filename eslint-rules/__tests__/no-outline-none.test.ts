import { describe, expect, test } from 'vitest';
import { findOutlineNoneViolations } from '../no-outline-none';

describe('FR-A11Y-008 no-outline-none rule', () => {
  test('flags outline none and outline zero', () => {
    expect(findOutlineNoneViolations('const css = "button { outline: none; }";')).toHaveLength(1);
    expect(findOutlineNoneViolations('const css = `.x { outline: 0; }`;')).toHaveLength(1);
  });

  test('allows focus-visible fallback blocks with a visible box-shadow ring', () => {
    expect(
      findOutlineNoneViolations(`
        const css = '.focus-ring-fallback:focus-visible { outline: none; box-shadow: 0 0 0 2px gold; }';
      `),
    ).toEqual([]);
  });
});
