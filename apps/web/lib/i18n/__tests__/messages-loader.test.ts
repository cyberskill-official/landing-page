import { describe, expect, test } from 'vitest';
import { getNarrativeLine, loadNarrativeLines } from '../messages-loader';

describe('FR-CMS-007 messages loader', () => {
  test('loads active English and Vietnamese narrative lines', () => {
    expect(getNarrativeLine('en', 'scene-0-hero-primary')?.text).toContain('Whisper');
    expect(getNarrativeLine('vi', 'scene-0-hero-primary')?.text).toContain('Thì thầm');
  });

  test('filters retired narrative lines at the loader boundary', () => {
    expect(loadNarrativeLines('en').every((line) => line.role !== 'retired')).toBe(true);
    expect(loadNarrativeLines('vi').every((line) => line.role !== 'retired')).toBe(true);
  });
});

