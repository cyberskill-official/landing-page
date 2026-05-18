'use client';

import React from 'react';
import type { Locale } from '@/lib/i18n';
import { trackEvent } from '@/lib/analytics';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { getLumiTaglineAriaLabel, LUMI_TAGLINE_HOVER } from '@/lib/lumi/tagline';
import { type LumiTaglineTrigger, useTaglineState } from '@/lib/lumi/use-tagline-state';

export function LumiTaglineReveal({ locale }: { locale: Locale }) {
  const reducedMotion = useReducedMotion();
  const { active, canReveal, trigger } = useTaglineState(locale);

  if (!canReveal && !active) return null;

  const reveal = (triggerType: LumiTaglineTrigger) => {
    if (!trigger()) return;
    trackEvent('vi_tagline_revealed', { locale, trigger_type: triggerType });
  };

  const transitionVars = {
    '--lumi-tagline-transition-ms': reducedMotion ? '0ms' : '240ms',
  } as React.CSSProperties;

  return (
    <div className="lumi-tagline" data-lumi-tagline-reveal>
      <button
        type="button"
        className="lumi-tagline__trigger"
        aria-label={getLumiTaglineAriaLabel(locale)}
        aria-describedby="lumi-tagline-status"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') reveal('hover');
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== 'mouse') reveal('tap');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            reveal('keyboard');
          }
        }}
      >
        Lumi
      </button>
      <span
        id="lumi-tagline-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`lumi-tagline__bubble${active ? ' is-active' : ''}`}
        style={transitionVars}
      >
        {active ? LUMI_TAGLINE_HOVER : ''}
      </span>
    </div>
  );
}
