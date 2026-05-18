import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { getNarrativeLine } from '@/lib/i18n/messages-loader';
import { getScene0HeroCopy } from '../Scene0Hero';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function source(file: string) {
  return readFile(path.join(appRoot, file), 'utf8');
}

describe('FR-SCENE-009 Scene 0 hero contract', () => {
  test('uses canonical Scene 0 title and narration copy', () => {
    expect(getScene0HeroCopy('en')).toEqual({
      caption: getNarrativeLine('en', 'scene-0-hero-primary')?.text,
      title: 'What if your will became real?',
    });
    expect(getScene0HeroCopy('vi')).toEqual({
      caption: getNarrativeLine('vi', 'scene-0-hero-primary')?.text,
      title: 'Neu y chi cua ban thanh hien thuc?',
    });
    expect(getScene0HeroCopy('fr' as 'en')).toEqual({
      caption: getNarrativeLine('en', 'scene-0-hero-primary')?.text,
      title: 'What if your will became real?',
    });
  });

  test('registers the canonical tunnel id and mocked fly_in-to-idle sequence', async () => {
    const client = await source('components/scenes/scene-0-hero/Scene0Hero.client.tsx');
    const canvas = await source('components/scenes/scene-0-hero/Scene0HeroCanvas.tsx');

    expect(client).toContain('SceneTunnel id="scene-0-hero"');
    expect(client).toContain("setCurrentAnim('fly_in')");
    expect(client).toContain("setCurrentAnim('idle')");
    expect(client).toContain('window.__scene0HeroState');
    expect(client).toContain("sequence: ['fly_in']");
    expect(canvas).toContain("preloadGltfWithLocalDecoders('/lumi.glb')");
    expect(canvas).toContain('scene-0-hero-lumi-mock-contract');
  });

  test('keeps Scene 0 free of nón lá accessory content', async () => {
    const client = await source('components/scenes/scene-0-hero/Scene0Hero.client.tsx');
    const canvas = await source('components/scenes/scene-0-hero/Scene0HeroCanvas.tsx');

    expect(`${client}\n${canvas}`).not.toMatch(/nonla|nón|hat_socket|hat/i);
  });
});
