import { describe, expect, test } from 'vitest';
import { AdditiveBlending, Vector3 } from 'three';
import {
  createPaintTrailGeometry,
  createPaintTrailUniforms,
  getPaintTrailDrawProgress,
  PAINT_TRAIL_COLOR,
  PAINT_TRAIL_SEGMENTS,
} from '../PaintTrail';
import { getPullQuoteOpacity } from '../PullQuote';
import { getSketchMorphWeight } from '../SketchToAppMorph';

describe('FR-SCENE-014 Scene 2 transformation primitives', () => {
  test('paint trail uses six radial segments, gold uniform, and additive blending contract', () => {
    const geometry = createPaintTrailGeometry();
    const uniforms = createPaintTrailUniforms();

    expect(PAINT_TRAIL_SEGMENTS).toBe(6);
    expect(uniforms.uColor.value).toEqual(new Vector3(...PAINT_TRAIL_COLOR));
    expect(AdditiveBlending).toBe(2);
    expect(geometry.type).toBe('TubeGeometry');
  });

  test('maps scene progress to draw, morph, and quote windows', () => {
    expect(getPaintTrailDrawProgress(0)).toBe(0);
    expect(getPaintTrailDrawProgress(0.2)).toBe(0.5);
    expect(getPaintTrailDrawProgress(0.4)).toBe(1);
    expect(getSketchMorphWeight(0.45)).toBe(0);
    expect(getSketchMorphWeight(0.65)).toBeCloseTo(0.5);
    expect(getSketchMorphWeight(0.85)).toBeCloseTo(1);
    expect(getPullQuoteOpacity(0.39)).toBe(0);
    expect(getPullQuoteOpacity(0.4)).toBe(1);
    expect(getPullQuoteOpacity(0.86)).toBe(0);
  });
});
