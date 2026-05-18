import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import * as cinematic from '../src/index.js';
import * as tokens from '../src/tokens/index.js';
import * as accents from '../src/tokens/accents.js';
import * as colors from '../src/tokens/colors.js';
import * as glow from '../src/tokens/glow.js';
import * as motion from '../src/tokens/motion.js';
import * as typography from '../src/tokens/typography.js';
import { LIFECYCLE_RULES, LIFECYCLE_STAGE } from '../src/lifecycle.js';

const here = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(resolve(here, '..', 'package.json'), 'utf8'),
) as {
  private?: boolean;
  sideEffects?: boolean;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, unknown>;
};

describe('FR-DS-003 — Cinematic Pack package skeleton', () => {
  test('AC#3 and AC#4: package is private, peer-only, and tree-shakeable', () => {
    expect(packageJson.private).toBe(true);
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.dependencies ?? {}).toEqual({});
    expect(packageJson.peerDependencies?.['@cyberskill/ds-foundations']).toBe('^1.0.0');
  });

  test('AC#5: documented package export paths are declared', () => {
    expect(packageJson.exports).toEqual(
      expect.objectContaining({
        '.': expect.any(Object),
        './tokens': expect.any(Object),
        './tokens/colors': expect.any(Object),
        './tokens/colors/accents': expect.any(Object),
        './tokens/motion': expect.any(Object),
        './tokens/typography': expect.any(Object),
        './tokens/glow': expect.any(Object),
        './lifecycle': expect.any(Object),
      }),
    );
  });

  test('AC#5: documented source exports are reachable', () => {
    expect(tokens.colors).toBeDefined();
    expect(tokens.motion).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.glow).toBeDefined();
    expect(colors.gold).toBeDefined();
    expect(accents.accent).toBeDefined();
    expect(motion.duration).toBeDefined();
    expect(typography.family).toBeDefined();
    expect(glow.glow).toBeDefined();
  });

  test('AC#6: lifecycle starts at Experimental with governed day counts', () => {
    expect(LIFECYCLE_STAGE).toBe('Experimental');
    expect(LIFECYCLE_RULES.experimental_to_stable_min_days).toBe(28);
    expect(LIFECYCLE_RULES.stable_to_promoted_min_days).toBe(180);
    expect(LIFECYCLE_RULES.deprecation_sunset_days).toBe(90);
  });

  test('AC#1: root barrel re-exports tokens and lifecycle', () => {
    expect(cinematic.colors).toBeDefined();
    expect(cinematic.motion).toBeDefined();
    expect(cinematic.typography).toBeDefined();
    expect(cinematic.glow).toBeDefined();
    expect(cinematic.accents).toBeDefined();
    expect(cinematic.LIFECYCLE_STAGE).toBe('Experimental');
  });
});
