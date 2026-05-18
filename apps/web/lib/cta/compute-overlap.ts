export const HCMC_TZ = 'Asia/Ho_Chi_Minh';
export const HCMC_WORK_START_HOUR = 9;
export const HCMC_WORK_END_HOUR = 17;
export const VISITOR_AFTERNOON_START_HOUR = 13;
export const VISITOR_AFTERNOON_END_HOUR = 18;

export type OverlapPeriod = 'morning' | 'afternoon' | 'evening' | 'none';
export type OverlapSemanticLabel = 'great' | 'small' | 'none' | 'full';

export type OverlapResult = {
  overlapHours: number;
  overlapPeriod: OverlapPeriod;
  hcmcInWorkingHours: boolean;
  visitorAfternoonStart: Date;
  visitorAfternoonEnd: Date;
  hcmcWorkStart: Date;
  hcmcWorkEnd: Date;
  semanticLabel: OverlapSemanticLabel;
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function computeOverlap(now: Date, visitorTz: string): OverlapResult {
  const safeVisitorTz = isValidTimeZone(visitorTz) ? visitorTz : 'UTC';
  const hcmcParts = getZonedParts(now, HCMC_TZ);
  const visitorParts = getZonedParts(now, safeVisitorTz);

  const hcmcWorkStart = zonedDateTimeToUtc({ ...hcmcParts, hour: HCMC_WORK_START_HOUR, minute: 0, second: 0 }, HCMC_TZ);
  const hcmcWorkEnd = zonedDateTimeToUtc({ ...hcmcParts, hour: HCMC_WORK_END_HOUR, minute: 0, second: 0 }, HCMC_TZ);
  const visitorAfternoonStart = zonedDateTimeToUtc(
    { ...visitorParts, hour: VISITOR_AFTERNOON_START_HOUR, minute: 0, second: 0 },
    safeVisitorTz,
  );
  const visitorAfternoonEnd = zonedDateTimeToUtc(
    { ...visitorParts, hour: VISITOR_AFTERNOON_END_HOUR, minute: 0, second: 0 },
    safeVisitorTz,
  );

  const overlapStart = Math.max(hcmcWorkStart.getTime(), visitorAfternoonStart.getTime());
  const overlapEnd = Math.min(hcmcWorkEnd.getTime(), visitorAfternoonEnd.getTime());
  const overlapHours = Math.max(0, roundHours((overlapEnd - overlapStart) / 3_600_000));

  return {
    overlapHours,
    overlapPeriod: inferOverlapPeriod(overlapHours, new Date(overlapStart), safeVisitorTz),
    hcmcInWorkingHours: isHcmcInWorkingHours(now),
    visitorAfternoonStart,
    visitorAfternoonEnd,
    hcmcWorkStart,
    hcmcWorkEnd,
    semanticLabel: semanticLabelFor(overlapHours),
  };
}

export function getVisitorTimezone(): string {
  if (typeof window === 'undefined') return 'UTC';

  const localStorageTz = readLocalStorageTimezone();
  if (localStorageTz) return localStorageTz;

  const cookieTz = readCookieTimezone();
  if (cookieTz) return cookieTz;

  const intlTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (isValidTimeZone(intlTz)) return intlTz;

  return timezoneFromOffset(new Date().getTimezoneOffset());
}

export function formatClock(date: Date, timeZone: string, locale = 'en-US', hour12?: boolean): string {
  const safeTimeZone = isValidTimeZone(timeZone) ? timeZone : 'UTC';
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  }).format(date);
}

export function formatTimezoneLabel(timeZone: string): string {
  return timeZone.replaceAll('_', ' ');
}

export function describeOverlap(result: OverlapResult, locale: 'en' | 'vi' = 'en'): string {
  if (locale === 'vi') {
    if (result.semanticLabel === 'full') return 'Trung hoan toan mui gio lam viec.';
    if (result.semanticLabel === 'great') return 'Trung gio tot voi buoi chieu cua ban.';
    if (result.semanticLabel === 'small') return 'Trung gio nho vao cuoi buoi chieu cua ban.';
    return 'Khong trung truc tiep. Chung toi co ca sang som va toi muon cho cuoc goi quoc te.';
  }

  if (result.semanticLabel === 'full') return "Full overlap. We're in the same working window.";
  if (result.semanticLabel === 'great') return 'Great overlap with your afternoon.';
  if (result.semanticLabel === 'small') return 'Small overlap in your late afternoon.';
  return 'No direct working overlap. We do early mornings and late evenings for international calls.';
}

export function isHcmcInWorkingHours(now: Date): boolean {
  const parts = getZonedParts(now, HCMC_TZ);
  const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return day >= 1 && day <= 5 && parts.hour >= HCMC_WORK_START_HOUR && parts.hour < HCMC_WORK_END_HOUR;
}

export function isValidTimeZone(timeZone: string | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = new Map<string, string>();
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts.set(part.type, part.value);
  }

  return {
    year: Number(parts.get('year') ?? '1970'),
    month: Number(parts.get('month') ?? '1'),
    day: Number(parts.get('day') ?? '1'),
    hour: Number(parts.get('hour') ?? '0'),
    minute: Number(parts.get('minute') ?? '0'),
    second: Number(parts.get('second') ?? '0'),
  };
}

export function zonedDateTimeToUtc(parts: ZonedParts, timeZone: string): Date {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const firstCandidate = utcGuess - firstOffset;
  const correctedOffset = getTimeZoneOffsetMs(new Date(firstCandidate), timeZone);
  return new Date(utcGuess - correctedOffset);
}

export function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const zonedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
  return zonedAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function inferOverlapPeriod(overlapHours: number, overlapStart: Date, visitorTz: string): OverlapPeriod {
  if (overlapHours <= 0) return 'none';
  const hour = getZonedParts(overlapStart, visitorTz).hour;
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function semanticLabelFor(overlapHours: number): OverlapSemanticLabel {
  if (overlapHours >= 7) return 'full';
  if (overlapHours >= 4) return 'great';
  if (overlapHours >= 1) return 'small';
  return 'none';
}

function roundHours(hours: number): number {
  return Math.round(hours * 4) / 4;
}

function readLocalStorageTimezone(): string | null {
  try {
    const value = window.localStorage.getItem('cyberskill_tz_pref');
    return isValidTimeZone(value ?? undefined) ? value : null;
  } catch {
    return null;
  }
}

function readCookieTimezone(): string | null {
  if (typeof document === 'undefined') return null;
  const encodedValue = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('cyberskill_tz_pref='))
    ?.split('=')[1];
  if (!encodedValue) return null;

  const value = decodeURIComponent(encodedValue);
  return isValidTimeZone(value) ? value : null;
}

function timezoneFromOffset(offsetMinutes: number): string {
  if (!Number.isFinite(offsetMinutes) || offsetMinutes % 60 !== 0) return 'UTC';
  const hoursAheadOfUtc = -offsetMinutes / 60;
  if (hoursAheadOfUtc === 0) return 'UTC';
  const etcSign = hoursAheadOfUtc > 0 ? '-' : '+';
  const candidate = `Etc/GMT${etcSign}${Math.abs(hoursAheadOfUtc)}`;
  return isValidTimeZone(candidate) ? candidate : 'UTC';
}
