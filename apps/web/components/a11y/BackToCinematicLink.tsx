'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { clearLitePref } from '@/lib/lite-pref-storage';

export function BackToCinematicLink({
  className,
  label = 'Back to cinematic',
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const liveRegionRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <a
        className={className}
        href="/"
        data-clear-lite-pref
        onClick={(event) => {
          event.preventDefault();
          clearLitePref();
          try {
            sessionStorage.setItem('cyberskill_cinematic_override', '1');
          } catch {
            // Session override is best-effort; the explicit click still navigates.
          }
          trackEvent('lite_mode_toggled', {
            from: 'lite',
            to: 'cinematic',
            source: 'click',
          });
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = 'Switching to cinematic mode';
          }
          window.setTimeout(() => {
            router.push('/');
          }, 100);
        }}
      >
        {label}
      </a>
      <span ref={liveRegionRef} className="visually-hidden" aria-live="polite" aria-atomic="true" data-back-cinematic-status />
    </>
  );
}
