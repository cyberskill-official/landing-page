'use client';

import React from 'react';
import { useEffect, useState } from 'react';

type HiringState = {
  count: number | null;
  error?: string;
};

export function HiringBadge() {
  const [data, setData] = useState<HiringState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/jobs-count')
      .then((response) => response.json())
      .then((payload: HiringState) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setData({ count: null, error: 'fetch failed' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  if (data.count === null) {
    return (
      <a className="hiring-badge hiring-badge--fallback" href="/work">
        We're growing - get in touch
      </a>
    );
  }

  if (data.count === 0) {
    return (
      <a className="hiring-badge hiring-badge--zero" href="/work?passive=1">
        We're not hiring right now - leave us your details
      </a>
    );
  }

  return (
    <a className="hiring-badge hiring-badge--active" href="/work?role=open">
      We're hiring {data.count} - see open roles
    </a>
  );
}
