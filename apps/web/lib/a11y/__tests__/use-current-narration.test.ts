import { describe, expect, test } from 'vitest';
import { getNarrationForScene } from '../use-current-narration';

describe('FR-A11Y-006 current narration lookup', () => {
  test('resolves localized primary narration by active scene ordinal', () => {
    expect(getNarrationForScene('en', 0)).toMatchObject({
      sceneId: 'scene-0',
      sceneNumber: 1,
      text: "Whisper an idea. I'll show you the rest.",
    });
    expect(getNarrationForScene('vi', 0)?.text).toContain('Thì thầm');
    expect(getNarrationForScene('en', 6)?.text).toBe('You bring the will. We bring the real.');
  });

  test('returns null for invalid or unavailable scenes', () => {
    expect(getNarrationForScene('en', null)).toBeNull();
    expect(getNarrationForScene('en', Number.NaN)).toBeNull();
    expect(getNarrationForScene('en', 42)).toBeNull();
  });
});
