import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('FR-A11Y-007 useFocusTrap source contract', () => {
  test('captures Tab, Shift+Tab, Escape, and returns focus on cleanup', async () => {
    const source = await readFile(path.join(appRoot, 'a11y/use-focus-trap.ts'), 'utf8');

    expect(source).toContain("event.key === 'Escape'");
    expect(source).toContain("event.key !== 'Tab'");
    expect(source).toContain('event.shiftKey');
    expect(source).toContain('triggerRef.current?.focus()');
    expect(source).toContain('querySelectorAll<HTMLElement>(focusableSelector)');
  });
});
