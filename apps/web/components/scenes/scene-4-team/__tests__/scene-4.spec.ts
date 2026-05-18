import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { getBokehCountForTier } from '@/lib/dpr-scaling';
import { formatMemberTooltip, getAvatarScale, TEAM_AVATARS } from '../AvatarSphere';
import { BOKEH_POSITIONS } from '../BokehLayer';

const sceneRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('FR-SCENE-016 Scene 4 team implementation', () => {
  test('defines ten privacy-safe avatars and tiered bokeh counts', () => {
    expect(TEAM_AVATARS).toHaveLength(10);
    expect(TEAM_AVATARS.every(({ member }) => !member.firstName.includes(' '))).toBe(true);
    expect(formatMemberTooltip(TEAM_AVATARS[0]!.member)).toBe('Minh - Senior Engineer');
    expect(getAvatarScale(-2)).toBe(0.15);
    expect(getAvatarScale(1)).toBe(0.3);
    expect(BOKEH_POSITIONS.length).toBeGreaterThanOrEqual(getBokehCountForTier('high'));
  });

  test('mounts through SceneTunnel and dims Lumi on entry', async () => {
    const source = await readFile(path.join(sceneRoot, 'Scene4Team.tsx'), 'utf8');
    const canvas = await readFile(path.join(sceneRoot, 'Scene4Canvas.tsx'), 'utf8');
    const hiring = await readFile(path.join(sceneRoot, 'HiringHook.tsx'), 'utf8');

    expect(source).toContain('<SceneTunnel id="scene-4-team"');
    expect(source).toContain('data-scene-index="4"');
    expect(canvas).toContain("setCurrentAnim('idle', 100)");
    expect(canvas).toContain('setEmissiveBoost(0.1)');
    expect(hiring).toContain('href="/work?action=join#join"');
  });
});
