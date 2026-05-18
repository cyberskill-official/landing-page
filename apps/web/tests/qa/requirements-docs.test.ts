import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function doc(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

function expectSections(source: string, sections: string[]) {
  for (const section of sections) {
    expect(source, `missing section: ${section}`).toContain(section);
  }
}

describe('requirements and QA documentation', () => {
  test('PRD contains the complete product-management spine', async () => {
    const prd = await doc('docs/product/PRD.md');

    expectSections(prd, [
      '## 1. Purpose',
      '## 2. Product Goals',
      '## 3. Audiences',
      '## 4. Product Scope',
      '## 5. Product Requirements',
      '## 6. Key User Journeys',
      '## 7. Success Metrics',
      '## 8. Risks',
      '## 9. Release Gates',
    ]);

    for (let index = 1; index <= 13; index += 1) {
      expect(prd).toContain(`PRD-${String(index).padStart(3, '0')}`);
    }
  });

  test('SRS defines functional, non-functional, interface, data, and security requirements', async () => {
    const srs = await doc('docs/product/SRS.md');

    expectSections(srs, [
      '## 4. Functional Requirements',
      '## 5. Non-Functional Requirements',
      '## 6. External Interfaces',
      '## 7. Data Requirements',
      '## 8. Security Requirements',
      '## 9. Acceptance Criteria',
      '## 10. Traceability',
    ]);

    for (let index = 1; index <= 15; index += 1) {
      expect(srs).toContain(`FR-${String(index).padStart(3, '0')}`);
    }
    for (let index = 1; index <= 7; index += 1) {
      expect(srs).toContain(`NFR-${String(index).padStart(3, '0')}`);
    }
  });

  test('test-case catalog covers every QA dimension and includes runnable commands', async () => {
    const cases = await doc('docs/qa/TEST-CASES.md');

    expectSections(cases, [
      '## 2. Test Commands',
      '## 3. Functional Test Cases',
      '## 4. Accessibility Test Cases',
      '## 5. SEO Test Cases',
      '## 6. Analytics and Privacy Test Cases',
      '## 7. Performance and 3D Guardrail Test Cases',
      '## 8. Launch and Operations Test Cases',
      '## 9. Localization Test Cases',
      '## 10. Manual Regression Checklist',
    ]);

    expect(cases).toContain('apps/web/node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit');
    expect(cases).toContain('node_modules/.bin/vitest run --config vitest.config.ts');
    expect(cases).toContain('node_modules/.bin/playwright test');
    expect(cases).toContain('node_modules/.bin/next build');
    expect((cases.match(/TC-[A-Z0-9]+-\d{3}/g) ?? []).length).toBeGreaterThanOrEqual(60);
  });

  test('coverage matrix maps requirements to test cases and automated files', async () => {
    const matrix = await doc('docs/qa/TEST-COVERAGE-MATRIX.md');

    expect(matrix).toContain('PRD-001 / FR-002 Home SSR value proposition');
    expect(matrix).toContain('PRD-010 / FR-010 Analytics proxy');
    expect(matrix).toContain('NFR-001 Accessibility');
    expect(matrix).toContain('NFR-002 Performance and 3D guardrails');
    expect(matrix).toContain('TC-DOC-001');
    expect(matrix).toContain('apps/web/tests/e2e/product-critical-paths.spec.ts');
    expect(matrix).toContain('manual production gates');
  });
});
