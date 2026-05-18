import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(appRoot, '../..');

describe('P6 OPS launch artifacts', () => {
  test('Vercel config ships regions, security headers, and www redirect', async () => {
    const config = JSON.parse(await readFile(path.join(appRoot, 'vercel.json'), 'utf8')) as {
      headers: Array<{ headers: Array<{ key: string; value: string }> }>;
      redirects: Array<{ destination: string; has: Array<{ value: string }> }>;
      regions: string[];
    };

    expect(config.regions).toEqual(['sin1', 'hnd1', 'iad1']);
    const headers = Object.fromEntries(config.headers[0]!.headers.map((header) => [header.key, header.value]));
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(config.redirects[0]!.has[0]!.value).toBe('www.cyberskill.world');
    expect(config.redirects[0]!.destination).toBe('https://cyberskill.world/:path*');
  });

  test('launch packets are honest about pending external/live gates', async () => {
    const [dns, cutover, awards, feedback, invitees] = await Promise.all([
      readFile(path.join(repoRoot, 'docs/launch/dns-setup.md'), 'utf8'),
      readFile(path.join(repoRoot, 'docs/launch/cutover-runbook.md'), 'utf8'),
      readFile(path.join(repoRoot, 'docs/launch/awards-submission-packet.md'), 'utf8'),
      readFile(path.join(repoRoot, 'docs/launch/week-8-feedback.md'), 'utf8'),
      readFile(path.join(repoRoot, 'docs/launch/soft-launch-invitees.md'), 'utf8'),
    ]);

    expect(dns).toContain('Live DNS cutover is pending');
    expect(cutover).toContain('Live cutover is pending');
    expect(awards).toContain('Final submission is blocked until public launch');
    expect(feedback).toContain('blocked until Scene 0 staging URL exists');
    expect(invitees).toContain('Final names pending founder selection');
  });
});
