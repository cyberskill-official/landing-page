import type { PortableTextBlock } from '@/lib/sanity/types.generated';

export function extractPortableText(blocks: PortableTextBlock[] = []): string {
  return blocks
    .filter((block) => block._type === 'block')
    .map((block) => block.children?.map((child) => child.text).join(' ') ?? '')
    .join(' ')
    .trim();
}

export function computeReadingTime(blocks: PortableTextBlock[] = [], wordsPerMinute = 200): number {
  const words = extractPortableText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

