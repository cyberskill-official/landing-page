import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'] as const;
export const BEST_PRACTICE_TAGS = ['best-practice'] as const;
export const BLOCKING_IMPACTS = ['serious', 'critical'] as const;

export type AxeImpact = 'minor' | 'moderate' | 'serious' | 'critical';

export type AxeViolation = {
  id: string;
  impact?: AxeImpact | null;
  help: string;
  helpUrl: string;
  nodes: Array<{ target: string[]; html?: string; failureSummary?: string }>;
};

export type AxeExclusion = {
  expiry: string;
  justification: string;
  ruleId: string;
  scope: 'all' | string[];
  selector: string;
};

type ExclusionsPayload = {
  exclusions: AxeExclusion[];
};

const repoRoot = path.resolve(process.cwd(), '../..');
const exclusionsPath = path.join(repoRoot, '.axe-config/exclusions.json');

export function loadAxeExclusions(): AxeExclusion[] {
  const payload = JSON.parse(readFileSync(exclusionsPath, 'utf8')) as ExclusionsPayload;
  return payload.exclusions;
}

export function isExpiryValid(expiry: string): boolean {
  return expiry === 'permanent' || /^p[0-9]+$/i.test(expiry) || !Number.isNaN(Date.parse(expiry));
}

export function assertNoExpiredExclusions(
  exclusions: AxeExclusion[],
  now = new Date(),
) {
  const expired = exclusions.filter((exclusion) => {
    if (exclusion.expiry === 'permanent' || /^p[0-9]+$/i.test(exclusion.expiry)) return false;
    const expiry = Date.parse(exclusion.expiry);
    return !Number.isNaN(expiry) && expiry < now.getTime();
  });

  if (expired.length > 0) {
    throw new Error(`Expired axe exclusions: ${expired.map((exclusion) => exclusion.ruleId).join(', ')}`);
  }
}

export function validateAxeExclusions(exclusions: AxeExclusion[], now = new Date()): void {
  for (const exclusion of exclusions) {
    if (!exclusion.ruleId || !exclusion.selector || !exclusion.justification || !exclusion.expiry) {
      throw new Error(`Invalid axe exclusion: ${JSON.stringify(exclusion)}`);
    }
    if (!isExpiryValid(exclusion.expiry)) {
      throw new Error(`Invalid axe exclusion expiry for ${exclusion.ruleId}: ${exclusion.expiry}`);
    }
    if (exclusion.expiry === 'permanent' && exclusion.justification.length <= 50) {
      throw new Error(`Permanent axe exclusion needs detailed justification: ${exclusion.ruleId}`);
    }
  }
  assertNoExpiredExclusions(exclusions, now);
}

export function exclusionAppliesToRoute(exclusion: AxeExclusion, route: string): boolean {
  return exclusion.scope === 'all' || exclusion.scope.includes(route);
}

export function applyAxeExclusions(builder: AxeBuilder, exclusions: AxeExclusion[], route: string): AxeBuilder {
  for (const exclusion of exclusions) {
    if (exclusionAppliesToRoute(exclusion, route)) {
      builder.exclude(exclusion.selector);
    }
  }
  return builder;
}

export function blockingViolations(violations: AxeViolation[]): AxeViolation[] {
  return violations.filter((violation) =>
    BLOCKING_IMPACTS.includes(violation.impact as (typeof BLOCKING_IMPACTS)[number]),
  );
}
