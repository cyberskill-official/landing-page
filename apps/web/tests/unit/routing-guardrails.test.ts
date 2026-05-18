import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { absoluteSiteUrl, generateRouteMetadata } from '../../lib/metadata-helpers';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(appRoot, '../..');

async function collectApiRoutes(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const routes: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) routes.push(...await collectApiRoutes(entryPath));
    else if (entry.name === 'route.ts') routes.push(path.relative(path.join(appRoot, 'app/api'), entryPath));
  }

  return routes.sort();
}

describe('FR-WEB-008 route guardrails', () => {
  test('uses App Router with FR-CMS-007 locale middleware', () => {
    expect(existsSync(path.join(appRoot, 'pages'))).toBe(false);
    expect(existsSync(path.join(appRoot, 'middleware.ts'))).toBe(true);
    expect(existsSync(path.join(repoRoot, 'middleware.ts'))).toBe(false);
  });

  test('keeps the API surface limited to sanctioned slice-1 routes', async () => {
    await expect(collectApiRoutes(path.join(appRoot, 'app/api'))).resolves.toEqual([
      'analytics/route.ts',
      'draft/disable/route.ts',
      'draft/route.ts',
      'health/route.ts',
      'jobs-count/route.ts',
      'lead/route.ts',
      'revalidate/route.ts',
    ]);
  });

  test('keeps typed routes enabled in Next config', async () => {
    const config = await readFile(path.join(appRoot, 'next.config.ts'), 'utf8');

    expect(config).toMatch(/typedRoutes:\s*true/);
  });

  test('uses metadata helper from every public route module', async () => {
    const routeFiles = [
      'app/page.tsx',
      'app/lite/page.tsx',
      'app/accessibility/page.tsx',
      'app/work/[slug]/page.tsx',
    ];

    for (const routeFile of routeFiles) {
      const source = await readFile(path.join(appRoot, routeFile), 'utf8');
      expect(source, routeFile).toContain('generateRouteMetadata');
    }
  });

  test('builds absolute canonical and hreflang metadata', () => {
    const metadata = generateRouteMetadata('/lite', {
      canonical: '/',
      hreflang: {
        'x-default': '/',
        vi: '/vi',
      },
    });

    expect(absoluteSiteUrl('/accessibility')).toBe('https://cyberskill.world/accessibility');
    expect(metadata.alternates?.canonical).toBe('https://cyberskill.world/');
    expect(metadata.alternates?.languages).toMatchObject({
      'x-default': 'https://cyberskill.world/',
      vi: 'https://cyberskill.world/vi',
    });
  });

  test('ships sitemap, robots, work loading, and work not-found modules', () => {
    expect(existsSync(path.join(appRoot, 'app/sitemap.ts'))).toBe(true);
    expect(existsSync(path.join(appRoot, 'app/robots.ts'))).toBe(true);
    expect(existsSync(path.join(appRoot, 'app/work/[slug]/loading.tsx'))).toBe(true);
    expect(existsSync(path.join(appRoot, 'app/work/[slug]/not-found.tsx'))).toBe(true);
  });
});
