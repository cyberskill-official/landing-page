import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import {
  getSkipStoryBreakpoint,
  skipStoryFocusDelay,
  SkipStoryPill,
} from '../../components/a11y/SkipStoryPill';

describe('FR-A11Y-003 SkipStoryPill', () => {
  test('renders the skip link before client enhancement', () => {
    const markup = renderToStaticMarkup(createElement(SkipStoryPill));

    expect(markup).toContain('href="#cta-hub"');
    expect(markup).toContain('class="skip-story-pill"');
    expect(markup).toContain('aria-label="Skip to call to action"');
    expect(markup).toContain('Skip story');
    expect(markup).toContain('data-skip-story-status="true"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-atomic="true"');
  });

  test('classifies viewport breakpoints for analytics', () => {
    expect(getSkipStoryBreakpoint(320)).toBe('mobile');
    expect(getSkipStoryBreakpoint(767)).toBe('mobile');
    expect(getSkipStoryBreakpoint(768)).toBe('tablet');
    expect(getSkipStoryBreakpoint(1279)).toBe('tablet');
    expect(getSkipStoryBreakpoint(1280)).toBe('desktop');
  });

  test('uses instant focus timing for reduced-motion scroll behavior', () => {
    expect(skipStoryFocusDelay('auto')).toBe(0);
    expect(skipStoryFocusDelay('smooth')).toBe(400);
  });
});
