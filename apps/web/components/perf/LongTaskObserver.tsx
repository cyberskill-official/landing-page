'use client';

import { useEffect } from 'react';
import { observeLongTasks } from '@/lib/perf/scheduler';

export function LongTaskObserver() {
  useEffect(() => observeLongTasks(), []);
  return null;
}
