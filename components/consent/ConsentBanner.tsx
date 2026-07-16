"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ConsentGate } from "@/lib/analytics/consent";
import { Button } from "@/components/ui/Button";

/**
 * Lightweight opt-in banner for session replay (Microsoft Clarity).
 *
 * Renders only when:
 * - NEXT_PUBLIC_CLARITY_ID is set (a gated tag exists), and
 * - the visitor has not yet decided (localStorage).
 *
 * Deferred a short idle so it never competes with LCP. Choice is stored as a
 * first-party localStorage preference (not a tracking cookie).
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

    // Restore prior choice before deciding whether to show the banner.
    ConsentGate.hydrate();
    if (ConsentGate.hasDecision()) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const show = () => setVisible(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(show, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(show, 2500);
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
    <div
      className="cs-consent-banner cs-surface-heavy cs-no-print"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cs-consent-title"
      aria-describedby="cs-consent-desc"
    >
      <div className="cs-consent-banner-inner">
        <div className="cs-consent-banner-copy">
          <p id="cs-consent-title" className="cs-consent-banner-title">
            {copy.title}
          </p>
          <p id="cs-consent-desc" className="cs-consent-banner-body">
            {copy.body}{" "}
            <Link href={`/${locale}/privacy`} className="cs-consent-banner-link">
              {copy.privacyLink}
            </Link>
          </p>
        </div>
        <div className="cs-consent-banner-actions">
          <Button type="button" variant="secondary" onClick={decline}>
            {copy.decline}
          </Button>
          <Button type="button" variant="primary" onClick={accept}>
            {copy.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
