import { describe, expect, test } from 'vitest';
import { CORE_EVENT_NAMES, ALL_EVENT_NAMES, isAnalyticsEventName } from '../events';

describe('FR-SEO-008 analytics taxonomy', () => {
  test('defines the 10 master-plan core events', () => {
    expect(CORE_EVENT_NAMES).toEqual([
      'scene_enter',
      'lumi_interact',
      'cta_view',
      'cta_click',
      'skip_story_used',
      'lite_mode_toggled',
      'mute_toggled',
      'form_submit',
      'form_error',
      'nonla_easter_egg',
    ]);
    expect(CORE_EVENT_NAMES).toHaveLength(10);
  });

  test('keeps operational extensions in the same validated name set', () => {
    expect(ALL_EVENT_NAMES).toContain('web_vitals');
    expect(ALL_EVENT_NAMES).toContain('vi_tagline_revealed');
    expect(isAnalyticsEventName('cta_click')).toBe(true);
    expect(isAnalyticsEventName('not_real')).toBe(false);
  });
});
