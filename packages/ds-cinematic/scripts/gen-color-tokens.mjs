#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const PALETTE_PATH = join(ROOT, 'design', 'tokens', 'palette-canonical.json');
const TOKENS_DIR = join(HERE, '..', 'src', 'tokens');
const palette = JSON.parse(readFileSync(PALETTE_PATH, 'utf8'));

const HEADER_TS = `// GENERATED — re-run packages/ds-cinematic/scripts/gen-color-tokens.mjs after editing
// design/tokens/palette-canonical.json. Do NOT hand-edit.
`;

const HEADER_CSS = `/* GENERATED — re-run packages/ds-cinematic/scripts/gen-color-tokens.mjs after editing
   design/tokens/palette-canonical.json. Do NOT hand-edit. */
`;

function assertHexRamp(name, ramp, expectedKeys) {
  const keys = Object.keys(ramp);
  if (keys.join(',') !== expectedKeys.join(',')) {
    throw new Error(`${name} keys must be ${expectedKeys.join(',')}; got ${keys.join(',')}`);
  }
  for (const [key, value] of Object.entries(ramp)) {
    if (!/^#[0-9A-F]{6}$/.test(value)) {
      throw new Error(`${name}.${key} is not an uppercase 6-digit hex value: ${value}`);
    }
  }
}

function tsRamp(name, ramp) {
  const body = Object.entries(ramp)
    .map(([key, value]) => `  ${`${key}:`.padEnd(5)} '${value}',`)
    .join('\n');
  return `export const ${name} = {
${body}
} as const satisfies Readonly<Record<string, \`#\${string}\`>>;`;
}

function cssRamp(prefix, ramp) {
  return Object.entries(ramp)
    .map(([key, value]) => `  ${prefix}${key}: ${value};`)
    .join('\n');
}

assertHexRamp('gold', palette.gold, ['50', '100', '200', '400', '500', '600']);
assertHexRamp('brown', palette.brown, ['50', '100', '200', '400', '500', '700']);

const ts = `${HEADER_TS}
${tsRamp('gold', palette.gold)}

${tsRamp('brown', palette.brown)}

export type GoldRamp = keyof typeof gold;
export type BrownRamp = keyof typeof brown;
`;

const css = `${HEADER_CSS}
:root {
${cssRamp('--brand-gold-', palette.gold)}

${cssRamp('--brand-brown-', palette.brown)}
}
`;

writeFileSync(join(TOKENS_DIR, 'colors.ts'), ts);
writeFileSync(join(TOKENS_DIR, 'colors.css'), css);
console.log('OK - wrote colors.ts + colors.css');
