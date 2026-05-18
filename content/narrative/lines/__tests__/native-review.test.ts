import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const linesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.resolve(linesRoot, '../../../apps/web');

async function readLinesFile(file: string) {
  return readFile(path.join(linesRoot, file), 'utf8');
}

describe('FR-CMS-009 Vietnamese native review packet', () => {
  test('ships rubric, banned phrases, and an honest pending review packet', async () => {
    const [rubric, banned, packet] = await Promise.all([
      readLinesFile('VI_REGISTER_RUBRIC.md'),
      readLinesFile('banned-phrases.txt'),
      readLinesFile('native-review-2026-05-17.md'),
    ]);

    expect(rubric).toContain('casual, warm, and precise');
    expect(rubric).toContain('Lumi — vì ánh sáng biến nguyện ước thành sự thật');
    expect(banned.trim().split('\n').length).toBeGreaterThanOrEqual(10);
    expect(packet).toContain('blocked pending paid out-of-team native-speaker review');
    expect(packet).toContain('Per-String Review Log');
    expect(packet).toContain('Cultural Review');
    expect(packet).toContain('Sign-Off');
  });

  test('current Vietnamese sources avoid known banned phrases', async () => {
    const [banned, narrative, uiMessages] = await Promise.all([
      readLinesFile('banned-phrases.txt'),
      readLinesFile('vi.json'),
      readFile(path.join(appRoot, 'messages/vi.json'), 'utf8'),
    ]);
    const source = `${narrative}\n${uiMessages}`.toLocaleLowerCase('vi');
    const phrases = banned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const phrase of phrases) {
      expect(source).not.toContain(phrase.toLocaleLowerCase('vi'));
    }
  });
});
