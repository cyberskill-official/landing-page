import { describe, expect, test } from 'vitest';
import { flattenBlockingViolations, renderA11yMarkdown } from '../a11y-summary.mjs';

const violation = {
  bestPracticeViolations: [],
  blockingViolations: [
    {
      help: 'Buttons must have discernible text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/button-name',
      id: 'button-name',
      impact: 'critical',
      nodes: [{ target: ['button.icon-only'] }],
    },
  ],
  route: '/',
  violations: [],
  viewport: 'mobile',
};

describe('FR-OPS-012 a11y summary', () => {
  test('flattens serious and critical findings with route and viewport context', () => {
    expect(flattenBlockingViolations([violation])).toEqual([
      {
        help: 'Buttons must have discernible text',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/button-name',
        impact: 'critical',
        route: '/',
        ruleId: 'button-name',
        selector: 'button.icon-only',
        viewport: 'mobile',
      },
    ]);
  });

  test('renders passing markdown with sentinel', () => {
    const markdown = renderA11yMarkdown([
      {
        bestPracticeViolations: [{ id: 'landmark-one-main' }],
        blockingViolations: [],
        route: '/lite',
        violations: [],
        viewport: 'desktop',
      },
    ]);

    expect(markdown).toContain('Verdict: PASS');
    expect(markdown).toContain('Best-practice warnings: 1');
    expect(markdown).toContain('<!-- a11y-report -->');
  });

  test('renders failing markdown with selector, impact, and help URL', () => {
    const markdown = renderA11yMarkdown([violation]);

    expect(markdown).toContain('Verdict: FAIL');
    expect(markdown).toContain('`button-name`');
    expect(markdown).toContain('critical');
    expect(markdown).toContain('`button.icon-only`');
    expect(markdown).toContain('https://dequeuniversity.com/rules/axe/4.11/button-name');
  });
});
