export type ABTest = {
  enabled: boolean;
  id: string;
  split: number[];
  target: string;
  variants: string[];
};

export const AB_TESTS = [
  {
    enabled: true,
    id: 'scene0_narration',
    split: [0.5, 0.5],
    target: 'content/narrative/lines/* scene-0 alt narration',
    variants: ['a', 'b'],
  },
  {
    enabled: false,
    id: 'cta_button_color',
    split: [0.5, 0.5],
    target: 'future CTA hub color treatment',
    variants: ['gold', 'warm-brown'],
  },
] as const satisfies readonly ABTest[];

export type ABTestId = (typeof AB_TESTS)[number]['id'];
