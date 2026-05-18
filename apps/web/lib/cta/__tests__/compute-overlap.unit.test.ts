import { describe, expect, test } from 'vitest';
import {
  HCMC_TZ,
  computeOverlap,
  describeOverlap,
  formatClock,
  isHcmcInWorkingHours,
  zonedDateTimeToUtc,
} from '../compute-overlap';

const tuesdayHcmcMorning = new Date('2026-01-06T03:00:00.000Z');

describe('FR-CTA-008 timezone overlap computation', () => {
  test('computes afternoon overlap for APAC visitor zones', () => {
    expect(computeOverlap(tuesdayHcmcMorning, 'Asia/Singapore').overlapHours).toBe(5);
    expect(computeOverlap(tuesdayHcmcMorning, 'Asia/Tokyo').overlapHours).toBe(5);
    expect(computeOverlap(tuesdayHcmcMorning, 'Australia/Sydney').overlapHours).toBe(5);
    expect(computeOverlap(tuesdayHcmcMorning, HCMC_TZ).overlapHours).toBe(4);
  });

  test('returns no afternoon overlap for London, New York, and Los Angeles', () => {
    expect(computeOverlap(tuesdayHcmcMorning, 'Europe/London')).toMatchObject({
      overlapHours: 0,
      overlapPeriod: 'none',
      semanticLabel: 'none',
    });
    expect(computeOverlap(tuesdayHcmcMorning, 'America/New_York').overlapHours).toBe(0);
    expect(computeOverlap(tuesdayHcmcMorning, 'America/Los_Angeles').overlapHours).toBe(0);
  });

  test('handles DST-aware local-to-UTC conversion through Intl timezones', () => {
    const londonSummerAfternoon = zonedDateTimeToUtc(
      { year: 2026, month: 7, day: 6, hour: 13, minute: 0, second: 0 },
      'Europe/London',
    );

    expect(londonSummerAfternoon.toISOString()).toBe('2026-07-06T12:00:00.000Z');
  });

  test('marks HCMC desk hours on weekdays only', () => {
    expect(isHcmcInWorkingHours(new Date('2026-01-06T03:00:00.000Z'))).toBe(true);
    expect(isHcmcInWorkingHours(new Date('2026-01-06T11:00:00.000Z'))).toBe(false);
    expect(isHcmcInWorkingHours(new Date('2026-01-10T03:00:00.000Z'))).toBe(false);
  });

  test('formats clocks and semantic copy with Intl', () => {
    expect(formatClock(tuesdayHcmcMorning, HCMC_TZ, 'en-US', false)).toBe('10:00');
    expect(describeOverlap(computeOverlap(tuesdayHcmcMorning, 'Asia/Tokyo'))).toContain('Great overlap');
    expect(describeOverlap(computeOverlap(tuesdayHcmcMorning, 'Europe/London'))).toContain('No direct');
  });
});
