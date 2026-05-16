// GENERATED — re-run packages/ds-cinematic/scripts/gen-color-tokens.mjs after editing
// design/tokens/palette-canonical.json. Do NOT hand-edit.

export const gold = {
  50:  '#FEF6D9',
  100: '#FCEAA8',
  200: '#F9D966',
  400: '#E8B523',
  500: '#C99317',
  600: '#9F730E',
} as const satisfies Readonly<Record<string, `#${string}`>>;

export const brown = {
  50:  '#F4E5D6',
  100: '#DDB995',
  200: '#A36A3F',
  400: '#6E3A18',
  500: '#4A2208',
  700: '#2C1304',
} as const satisfies Readonly<Record<string, `#${string}`>>;

export type GoldRamp = keyof typeof gold;
export type BrownRamp = keyof typeof brown;
