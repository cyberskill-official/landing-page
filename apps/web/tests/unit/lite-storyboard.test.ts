import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { STORYBOARD_PANELS } from '../../components/lite/storyboard-panels';

type NarrativeLine = {
  id: string;
  scene_id: string;
  text: string;
  role: string;
};

type NarrativeLinesFile = {
  lines: NarrativeLine[];
};

type SceneDef = {
  id: string;
  narration_line_ids: string[];
};

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(appRoot, '../..');
const storyboardRoot = path.join(appRoot, 'public/storyboard');

function svgFileName(svgPath: string) {
  return svgPath.replace('/storyboard/', '');
}

function textNodes(svg: string) {
  return Array.from(svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/g), (match) => match[1] ?? '');
}

async function readNarrativeLines() {
  const raw = await readFile(path.join(repoRoot, 'content/narrative/lines/en.json'), 'utf8');
  return JSON.parse(raw) as NarrativeLinesFile;
}

async function readSceneDefs() {
  const raw = await readFile(path.join(repoRoot, 'content/narrative/scene-defs.json'), 'utf8');
  return JSON.parse(raw) as SceneDef[];
}

describe('FR-A11Y-001 lite storyboard contract', () => {
  test('defines the seven panels in scene order with CMS narration verbatim', async () => {
    const [sceneDefs, lines] = await Promise.all([readSceneDefs(), readNarrativeLines()]);
    const sceneLineIdByScene = new Map(
      sceneDefs
        .filter((scene) => scene.id.startsWith('scene-'))
        .map((scene) => [scene.id, scene.narration_line_ids[0]]),
    );
    const textByLineId = new Map(lines.lines.map((line) => [line.id, line.text]));

    expect(STORYBOARD_PANELS.map((panel) => panel.id)).toEqual([
      'scene-0',
      'scene-1',
      'scene-2',
      'scene-3',
      'scene-4',
      'scene-5',
      'scene-6',
    ]);

    for (const panel of STORYBOARD_PANELS) {
      expect(panel.narration).toBe(textByLineId.get(sceneLineIdByScene.get(panel.id)));
      expect(panel.ctaPrimary.label).toBe('Book a Discovery Call');
    }
  });

  test('ships accessible SVG files inside the storyboard budget', async () => {
    let totalGzipBytes = 0;

    for (const panel of STORYBOARD_PANELS) {
      const svg = await readFile(path.join(storyboardRoot, svgFileName(panel.svgPath)), 'utf8');
      const gzipBytes = gzipSync(svg).byteLength;
      totalGzipBytes += gzipBytes;

      expect(svg).toContain('viewBox="0 0 1200 800"');
      expect(svg).toMatch(/<title\b[^>]*>/);
      expect(svg).toMatch(/<desc\b[^>]*>/);
      expect(textNodes(svg)).toContain(panel.title);
      expect(textNodes(svg)).toContain(panel.narration);
      expect(gzipBytes).toBeLessThanOrEqual(30 * 1024);
    }

    expect(totalGzipBytes).toBeLessThanOrEqual(200 * 1024);
  });
});
