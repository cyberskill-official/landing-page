import { AB_TESTS, type ABTest } from './tests';

export const AB_COOKIE_PREFIX = 'cyberskill_ab_';
export const AB_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export type VariantAssignment =
  | { reason: 'disabled'; setCookie: null; variant: null }
  | { reason: 'cookie' | 'forced' | 'assigned'; setCookie: string | null; variant: string };

export type ResolveVariantOptions = {
  cookieHeader?: string;
  random?: () => number;
  searchParams?: URLSearchParams;
  testId: string;
};

export function findABTest(testId: string): ABTest | null {
  return AB_TESTS.find((test) => test.id === testId && test.enabled) ?? null;
}

export function assignVariant(test: Pick<ABTest, 'split' | 'variants'>, random = Math.random) {
  const roll = random();
  let cumulative = 0;

  for (let index = 0; index < test.variants.length; index += 1) {
    cumulative += test.split[index] ?? 0;
    if (roll < cumulative) return test.variants[index] ?? test.variants.at(-1) ?? 'a';
  }

  return test.variants.at(-1) ?? 'a';
}

export function readVariantCookie(testId: string, cookieHeader = '') {
  const cookieName = `${AB_COOKIE_PREFIX}${testId}=`;
  const pair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(cookieName));

  return pair ? decodeURIComponent(pair.slice(cookieName.length)) : null;
}

export function resolveForcedVariant(test: ABTest, searchParams?: URLSearchParams) {
  const forced = searchParams?.get('force_variant');
  return forced && test.variants.includes(forced) ? forced : null;
}

export function buildVariantCookie(testId: string, variant: string) {
  return [
    `${AB_COOKIE_PREFIX}${testId}=${encodeURIComponent(variant)}`,
    `Max-Age=${AB_COOKIE_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
  ].join('; ');
}

export function resolveVariantAssignment({
  cookieHeader,
  random,
  searchParams,
  testId,
}: ResolveVariantOptions): VariantAssignment {
  const test = findABTest(testId);
  if (!test) return { reason: 'disabled', setCookie: null, variant: null };

  const forced = resolveForcedVariant(test, searchParams);
  if (forced) {
    return {
      reason: 'forced',
      setCookie: buildVariantCookie(testId, forced),
      variant: forced,
    };
  }

  const existing = readVariantCookie(testId, cookieHeader);
  if (existing && test.variants.includes(existing)) {
    return { reason: 'cookie', setCookie: null, variant: existing };
  }

  const assigned = assignVariant(test, random);
  return {
    reason: 'assigned',
    setCookie: buildVariantCookie(testId, assigned),
    variant: assigned,
  };
}
