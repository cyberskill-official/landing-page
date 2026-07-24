"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ConsentGate } from "@/lib/analytics/consent";
import { DesignSystemButton } from "@/lib/design-system/button";

/**
 * Opt-in banner for session replay (Microsoft Clarity).
 *
 * Renders only when NEXT_PUBLIC_CLARITY_ID is set and the visitor has not
 * decided yet. Short idle deferral so it never competes with LCP.
 * Choice lives in first-party localStorage (not a tracking cookie).
 *
 * No auto-accept: Accept must be an explicit click (PDPL/GDPR + consent stance).
 */
export function ConsentBanner({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [visible, setVisible] = useState(false);
  const copy = dict.consentBanner;

  useEffect(() => {
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (!clarityId) return;

    ConsentGate.hydrate();
    if (ConsentGate.hasDecision()) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const show = () => setVisible(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(show, { timeout: 3500 });
    } else {
      timeoutId = setTimeout(show, 2000);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!visible) return null;

  const accept = () => {
    ConsentGate.decide({ "session-replay": true });
    setVisible(false);
  };

  const decline = () => {
    ConsentGate.decide({ "session-replay": false });
    setVisible(false);
  };

  return (
    <aside
      className="cs-consent-banner cs-no-print"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cs-consent-title"
      aria-describedby="cs-consent-desc"
    >
      <div className="cs-consent-banner-inner">
        <div className="cs-consent-banner-copy">
          <p id="cs-consent-title" className="cs-consent-banner-title">
            <span className="cs-consent-banner-mark" aria-hidden="true" />
            <span>{copy.title}</span>
          </p>
          <p id="cs-consent-desc" className="cs-consent-banner-body">
            {copy.body}{" "}
            <Link href={`/${locale}/privacy`} className="cs-consent-banner-link">
              {copy.privacyLink}
            </Link>
          </p>
        </div>
        <div className="cs-consent-banner-actions">
          <DesignSystemButton type="button" variant="secondary" onClick={decline}>
            {copy.decline}
          </DesignSystemButton>
          <DesignSystemButton type="button" variant="primary" onClick={accept}>
            {copy.accept}
          </DesignSystemButton>
        </div>
      </div>
    </aside>
  );
}
