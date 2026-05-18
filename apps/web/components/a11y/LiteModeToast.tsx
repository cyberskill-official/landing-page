'use client';

import { useEffect, useState } from 'react';
import { getLitePref } from '@/lib/lite-pref-storage';
import { BackToCinematicLink } from './BackToCinematicLink';

const TOAST_SEEN_KEY = 'cyberskill_lite_toast_seen';

export function LiteModeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (getLitePref() !== '1') return;
      if (sessionStorage.getItem(TOAST_SEEN_KEY) === '1') return;
      sessionStorage.setItem(TOAST_SEEN_KEY, '1');
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <aside className="lite-mode-toast" role="status" aria-live="polite" data-lite-mode-toast>
      <span>You're now in lite mode.</span>
      <BackToCinematicLink className="lite-mode-toast__link" />
    </aside>
  );
}
