import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Object3D } from 'three';
import { describe, expect, test } from 'vitest';
import {
  HEAD_TURN_TARGETS,
  MAX_HEAD_TURN,
  clampHeadTurn,
  nextHeadTurnRotation,
  resolveHeadBone,
} from '../LumiHeadTurn';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-SCENE-018 Scene 6 CTA hub implementation', () => {
  test('maps CTA focus to clamped, damped head-turn rotations', () => {
    expect(HEAD_TURN_TARGETS).toMatchObject({ buy: -0.45, partner: 0, join: 0.45 });
    expect(clampHeadTurn(1)).toBe(MAX_HEAD_TURN);
    expect(clampHeadTurn(-1)).toBe(-MAX_HEAD_TURN);
    expect(nextHeadTurnRotation(0, 'buy')).toBeCloseTo(-0.036, 3);
    expect(nextHeadTurnRotation(0.5, 'join')).toBeLessThanOrEqual(MAX_HEAD_TURN);
  });

  test('resolves common head bone names from the Lumi rig', () => {
    const root = new Object3D();
    const head = new Object3D();
    head.name = 'Head';
    root.add(head);

    expect(resolveHeadBone(root)).toBe(head);
  });

  test('mounts the DOM CTA hub beside a scene tunnel and deep-link handler', async () => {
    const scene = await source('components/scenes/scene-6-cta-hub/Scene6CtaHub.tsx');
    const page = await source('app/page.tsx');

    expect(scene).toContain('You bring the will. We bring the real.');
    expect(scene).toContain('<CtaHub locale={locale} />');
    expect(scene).toContain('<TimezoneClock locale={locale} variant="compact" />');
    expect(scene).toContain('SceneTunnel id="scene-6-cta-hub"');
    expect(scene).toContain("new URLSearchParams(window.location.search).get('track')");
    expect(page).toContain('<Scene6CtaHub locale={locale} />');
  });
});
