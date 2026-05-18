'use client';

import { useEffect, useState } from 'react';
import { detectDeviceTier, type DeviceTier } from './device-tier';
import { useLowMemoryMode } from './stores';

export function useDeviceTier(): DeviceTier {
  const lowMemoryMode = useLowMemoryMode();
  const [tier, setTier] = useState<DeviceTier>('high');

  useEffect(() => {
    const update = () => setTier(detectDeviceTier({ lowMemoryMode }));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [lowMemoryMode]);

  return lowMemoryMode ? 'low' : tier;
}
