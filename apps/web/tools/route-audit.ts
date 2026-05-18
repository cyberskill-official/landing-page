import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { getPublishedCaseStudySlugs } from '../lib/case-studies.ts';

const appRoot = path.resolve(process.cwd(), 'app');
const siteUrl = 'https://cyberskill.world';
const sitemapRoutes = new Set([
  '/',
  '/work',
  '/capabilities',
  '/team',
  '/careers',
  '/lite',
  '/accessibility',
  ...getPublishedCaseStudySlugs().map((slug) => `/work/${slug}`),
]);

function absoluteSiteUrl(routePath: string) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${siteUrl}${normalized}`;
}

function routeFromPage(filePath: string) {
  const relative = path.relative(appRoot, path.dirname(filePath));
  const segments = relative
    .split(path.sep)
    .filter((segment) => segment && !segment.startsWith('('))
    .map((segment) => segment.replace(/^\[(.+)]$/, ':$1'));

  return `/${segments.join('/')}`.replace(/\/$/, '') || '/';
}

function walk(directory: string): string[] {
  const entries = readdirSync(directory);
  const pages: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry);
    const stat = statSync(entryPath);
    if (stat.isDirectory()) pages.push(...walk(entryPath));
    else if (entry === 'page.tsx') pages.push(entryPath);
  }

  return pages;
}

console.log('route,canonical,hreflang_x_default,sitemap_included');
for (const route of walk(appRoot).map(routeFromPage).sort()) {
  const concreteRoute = route === '/work/:slug' ? '/work/sample' : route;
  console.log([
    route,
    absoluteSiteUrl(concreteRoute),
    route === '/lite' ? absoluteSiteUrl('/') : absoluteSiteUrl(concreteRoute),
    sitemapRoutes.has(concreteRoute),
  ].join(','));
}
