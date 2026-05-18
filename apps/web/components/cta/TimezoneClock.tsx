'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  HCMC_TZ,
  computeOverlap,
  describeOverlap,
  formatClock,
  formatTimezoneLabel,
  getVisitorTimezone,
} from '@/lib/cta/compute-overlap';

type TimezoneClockProps = {
  locale?: 'en' | 'vi';
  variant?: 'full' | 'compact';
};

const copy = {
  en: {
    eyebrow: 'Live overlap',
    hcmc: 'HCMC',
    visitor: 'Your zone',
    desk: "We're at our desks",
    offHours: "We're off-hours",
    schedule: 'Schedule with me',
    detail: 'HCMC working window is 09:00-17:00 ICT, Monday-Friday. Visitor afternoon window is 13:00-18:00 local.',
    hours: (hours: number) => `${formatHours(hours)} ${hours === 1 ? 'hour' : 'hours'} of overlap with your afternoon`,
  },
  vi: {
    eyebrow: 'Gio trung truc tiep',
    hcmc: 'TP.HCM',
    visitor: 'Mui gio cua ban',
    desk: 'Chung toi dang lam viec',
    offHours: 'Ngoai gio lam viec',
    schedule: 'Dat lich voi toi',
    detail: 'Khung lam viec TP.HCM la 09:00-17:00 ICT, thu Hai-den thu Sau. Buoi chieu cua ban la 13:00-18:00 theo gio dia phuong.',
    hours: (hours: number) => `${formatHours(hours)} gio trung voi buoi chieu cua ban`,
  },
} as const;

export function TimezoneClock({ locale = 'en', variant = 'full' }: TimezoneClockProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const [visitorTz, setVisitorTz] = useState('UTC');
  const messages = copy[locale];
  const overlap = useMemo(() => computeOverlap(now, visitorTz), [now, visitorTz]);
  const visitorHour12 = locale === 'en' ? undefined : false;

  useEffect(() => {
    setVisitorTz(getVisitorTimezone());
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside
      className={`timezone-clock timezone-clock--${variant}`}
      data-timezone-clock
      tabIndex={0}
      aria-label={`${messages.eyebrow}: ${messages.hours(overlap.overlapHours)}`}
      aria-describedby="timezone-clock-detail"
    >
      <div className="timezone-clock__header">
        <p className="timezone-clock__eyebrow">{messages.eyebrow}</p>
        <p
          className="timezone-clock__desk"
          data-state={overlap.hcmcInWorkingHours ? 'open' : 'closed'}
          aria-live="polite"
        >
          {overlap.hcmcInWorkingHours ? messages.desk : messages.offHours}
        </p>
      </div>
      <div className="timezone-clock__times" aria-live="off">
        <div>
          <span>{messages.hcmc}</span>
          <strong>{formatClock(now, HCMC_TZ, locale === 'vi' ? 'vi-VN' : 'en-GB', false)}</strong>
        </div>
        <div>
          <span>{messages.visitor}</span>
          <strong>{formatClock(now, visitorTz, locale === 'vi' ? 'vi-VN' : undefined, visitorHour12)}</strong>
        </div>
      </div>
      <p className="timezone-clock__overlap" data-overlap={overlap.semanticLabel}>
        {messages.hours(overlap.overlapHours)}
      </p>
      <p id="timezone-clock-detail" className="timezone-clock__detail">
        {describeOverlap(overlap, locale)} {messages.detail} {formatTimezoneLabel(visitorTz)}.
      </p>
      <a className="timezone-clock__schedule min-target" href="/?track=buy#cta-hub">
        {messages.schedule}
      </a>
    </aside>
  );
}

function formatHours(hours: number): string {
  if (Number.isInteger(hours)) return String(hours);
  return hours.toFixed(1);
}
