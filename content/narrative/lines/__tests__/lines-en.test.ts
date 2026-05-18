import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

type LumiLine = {
  id: string;
  scene_id: string;
  speaker: 'lumi' | 'company';
  text: string;
  word_count: number;
  role: 'primary' | 'alt-a' | 'alt-b';
  notes?: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(resolve(here, '..', 'en.json'), 'utf8');
const data = JSON.parse(raw) as { version: string; authored_at: string; lines: LumiLine[] };
const banned = /\b(synergize|world-class|cutting-edge|best-in-class)\b|\bleverage\b/i;
const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

describe('FR-CMS-002 English narration lines', () => {
  test('uses the expected versioned shape and unique IDs', () => {
    expect(data.version).toBe('1.0.0');
    expect(data.authored_at).toBe('2026-05-16');
    const ids = data.lines.map((line) => line.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('has primary lines for every scene and footer', () => {
    const primaryScenes = new Set(
      data.lines.filter((line) => line.role === 'primary').map((line) => line.scene_id),
    );
    expect([...primaryScenes].sort()).toEqual([
      'footer',
      'scene-0',
      'scene-1',
      'scene-2',
      'scene-3',
      'scene-4',
      'scene-5',
      'scene-6',
    ]);
  });

  test('enforces voice-rule punctuation and banned words', () => {
    expect(raw).not.toContain('!');
    expect(raw).not.toMatch(emoji);
    expect(raw).not.toMatch(banned);
  });

  test('keeps on-screen Lumi lines at or below 12 words per beat', () => {
    for (const line of data.lines) {
      expect(line.text).not.toHaveLength(0);
      expect(line.word_count).toBeGreaterThan(0);
      if (line.speaker === 'lumi') {
        expect(line.word_count).toBeLessThanOrEqual(12);
        expect(line.text).not.toMatch(/\bwe\b/i);
      }
      if (line.speaker === 'company') {
        expect(line.text).not.toMatch(/\bI\b|\bI'll\b/i);
      }
    }
  });

  test('preserves the canonical P0 primary copy', () => {
    const byId = new Map(data.lines.map((line) => [line.id, line.text]));
    expect(byId.get('scene-0-hero-primary')).toBe("Whisper an idea. I'll show you the rest.");
    expect(byId.get('scene-1-origin-primary')).toBe("Stephen had one rule: build what you'd be proud to sign.");
    expect(byId.get('scene-5-vietnam-global-primary')).toBe('From Sài Gòn to your time zone.');
    expect(byId.get('scene-6-cta-hub-primary')).toBe('You bring the will. We bring the real.');
  });
});
