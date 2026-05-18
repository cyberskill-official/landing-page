import { describe, expect, test } from 'vitest';
import { detectSaveData, type NavigatorWithConnection } from '../detect-save-data';

describe('FR-PERF-010 detectSaveData', () => {
  test('detects explicit save-data mode', () => {
    expect(detectSaveData({ connection: { saveData: true } } as NavigatorWithConnection)).toBe(true);
    expect(detectSaveData({ connection: { saveData: false } } as NavigatorWithConnection)).toBe(false);
    expect(detectSaveData(undefined)).toBe(false);
  });
});
