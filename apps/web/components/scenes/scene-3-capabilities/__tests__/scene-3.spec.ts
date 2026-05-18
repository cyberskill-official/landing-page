import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { CAPABILITY_SATELLITES, getSatelliteByClockPosition } from '../Satellite';
import { CLIENT_INDUSTRY_LOGOS } from '../LogosStrip';
import { getRibbonDrawProgress } from '../WispRibbon';

const sceneRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('FR-SCENE-015 Scene 3 capabilities implementation', () => {
  test('defines exactly four clock-positioned satellites with scoped cool tones', () => {
    expect(CAPABILITY_SATELLITES).toHaveLength(4);
    expect(getSatelliteByClockPosition(12)).toMatchObject({ label: 'React', position: [0, 2, 0], tint: '#7DD3FC' });
    expect(getSatelliteByClockPosition(3)).toMatchObject({ label: 'Three.js', position: [2, 0, 0], tint: '#E879F9' });
    expect(getSatelliteByClockPosition(6)).toMatchObject({ label: 'AI / RAG', position: [0, -2, 0], tint: '#84CC16' });
    expect(getSatelliteByClockPosition(9)).toMatchObject({ isHomeBase: true, tint: '#E8B523' });
    expect(CLIENT_INDUSTRY_LOGOS).toHaveLength(6);
    expect(getRibbonDrawProgress(0.15)).toBe(0);
    expect(getRibbonDrawProgress(0.7)).toBeCloseTo(1);
  });

  test('mounts through SceneTunnel and sets split_to_4 on scene entry', async () => {
    const source = await readFile(path.join(sceneRoot, 'Scene3Capabilities.tsx'), 'utf8');
    const canvas = await readFile(path.join(sceneRoot, 'Scene3Canvas.tsx'), 'utf8');

    expect(source).toContain('data-scene="scene-3"');
    expect(source).toContain('<SceneTunnel id="scene-3-capabilities"');
    expect(source).toContain('<LogosStrip />');
    expect(canvas).toContain("setCurrentAnim('split_to_4', 100)");
  });
});
