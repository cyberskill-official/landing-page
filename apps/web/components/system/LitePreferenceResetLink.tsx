'use client';

import { useState } from 'react';
import { clearLitePref } from '@/lib/lite-pref-storage';

export function LitePreferenceResetLink({ label }: { label: string }) {
  const [reset, setReset] = useState(false);

  return (
    <p className="preference-reset">
      <a
        href="/"
        data-lite-pref-reset
        onClick={(event) => {
          event.preventDefault();
          clearLitePref();
          setReset(true);
        }}
      >
        {label}
      </a>
      <span aria-live="polite" data-lite-pref-reset-status>
        {reset ? ' Preference reset.' : ''}
      </span>
    </p>
  );
}
