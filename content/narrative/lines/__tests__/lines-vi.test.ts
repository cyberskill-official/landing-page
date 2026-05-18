import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

type LineBase = {
  id: string;
  scene_id: string;
  speaker: 'lumi' | 'company';
  role: 'primary' | 'alt-a' | 'alt-b';
  notes?: string;
};

type ViLine = LineBase & {
  text: string;
  syllable_count: number;
};

const here = dirname(fileURLToPath(import.meta.url));
const viRaw = readFileSync(resolve(here, '..', 'vi.json'), 'utf8');
const enRaw = readFileSync(resolve(here, '..', 'en.json'), 'utf8');
const vi = JSON.parse(viRaw) as { version: string; authored_at: string; lines: ViLine[] };
const en = JSON.parse(enRaw) as { lines: LineBase[] };

const banned =
  /đẳng cấp thế giới|tiên tiến hàng đầu|tổng hợp lực|tận dụng (our|công ty|đội ngũ)|tốt nhất trong ngành/i;
const dialect = /\b(nha|dô|mầy|nhé|cơ|đấy)\b/i;
const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

describe('FR-CMS-003 Vietnamese narration lines', () => {
  test('mirrors every EN line ID and metadata field', () => {
    const enById = new Map(en.lines.map((line) => [line.id, line]));
    const viById = new Map(vi.lines.map((line) => [line.id, line]));
    expect([...viById.keys()].sort()).toEqual([...enById.keys()].sort());
    for (const [id, enLine] of enById) {
      const viLine = viById.get(id);
      expect(viLine).toBeDefined();
      expect(viLine?.scene_id).toBe(enLine.scene_id);
      expect(viLine?.speaker).toBe(enLine.speaker);
      expect(viLine?.role).toBe(enLine.role);
    }
  });

  test('enforces VI register guardrails', () => {
    expect(viRaw).toBe(viRaw.normalize('NFC'));
    expect(viRaw).not.toContain('!');
    expect(viRaw).not.toMatch(emoji);
    expect(viRaw).not.toMatch(banned);
    expect(viRaw).not.toMatch(dialect);
  });

  test('uses syllable counts and documents any multi-beat line', () => {
    for (const line of vi.lines) {
      expect(line.text).not.toHaveLength(0);
      expect(line.syllable_count).toBeGreaterThan(0);
      if (line.syllable_count > 14) {
        expect(line.notes ?? '').toMatch(/split|beat/i);
      }
    }
  });

  test('preserves cultural terms and the bilingual hover tagline', () => {
    expect(viRaw).toContain('Sài Gòn');
    expect(viRaw).toContain('Việt Nam');
    expect(viRaw).toContain('nguyện ước');
    const tagline = vi.lines.find((line) => line.id === 'lumi-tagline-hover');
    expect(tagline?.text).toBe('Lumi — vì ánh sáng biến nguyện ước thành sự thật');
  });
});
