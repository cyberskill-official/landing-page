"use client";

import { useEffect, useState } from "react";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TeardownCta({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [capExceeded, setCapExceeded] = useState(false);
  const [loadingCap, setLoadingCap] = useState(true);

  useEffect(() => {
    async function checkCap() {
      try {
        const res = await fetch("/api/teardown/status");
        if (res.ok) {
          const data = await res.json();
          setCapExceeded(data.capExceeded);
        }
      } catch (err) {
        console.error("Failed to check teardown cap status", err);
      } finally {
        setLoadingCap(false);
      }
    }
    void checkCap();
  }, []);

  return (
    <section id="teardown" className="cs-section cs-section-teardown" aria-labelledby="teardown-title">
      <div className="cs-container">
        <div className="cs-teardown-hero">
          <div className="cs-teardown-copy">
            <h2 id="teardown-title" className="cs-kt-h" style={{ fontSize: "var(--cs-text-3xl)", fontWeight: 800 }}>
              {dict.teardown.title}
            </h2>
            <p className="cs-section-lead">{dict.teardown.lead}</p>
          </div>

          <div className="cs-teardown-card cs-surface-light">
            {loadingCap ? (
              <div className="cs-teardown-loading">
                <span className="cs-loader" />
              </div>
            ) : capExceeded ? (
              <div className="cs-teardown-cap-full" role="status" aria-live="polite">
                <div className="cs-teardown-success-badge cs-teardown-success-badge-muted" aria-hidden="true">
                  <Icon name="sparkle" size="md" />
                </div>
                <h3 className="cs-teardown-success-title">{dict.teardown.capFullTitle}</h3>
                <p className="cs-teardown-success-body">{dict.teardown.capFullBody}</p>
                <GenieOpenButton className="cs-btn cs-btn-secondary" flow="contact">
                  <Icon name="sparkle" size="sm" /> {dict.genie.open}
                </GenieOpenButton>
              </div>
            ) : (
              <>
                <p className="cs-eyebrow" style={{ color: "var(--cs-color-primary)", margin: 0 }}>
                  {locale === "vi" ? "Qua Lumi" : "Via Lumi"}
                </p>
                <p className="cs-teardown-card-lead">
                  {locale === "vi"
                    ? "Chat ngắn: tên, email, URL site và trọng tâm (tuỳ chọn). Đội ngũ gửi PDF 15 điểm trong 3 ngày làm việc."
                    : "A short chat: name, email, site URL, and optional focus. We email the 15-point PDF in 3 business days."}
                </p>
                <ol className="cs-teardown-success-steps" style={{ marginBottom: "var(--cs-space-md)" }}>
                  <li>{dict.teardown.successStep1}</li>
                  <li>{dict.teardown.successStep2}</li>
                  <li>{dict.teardown.successStep3}</li>
                </ol>
                <GenieOpenButton
                  className="cs-btn cs-btn-primary cs-btn-lumi"
                  flow="teardown"
                  seed={dict.teardown.lumiSeed}
                >
                  <Icon name="sparkle" size="sm" /> {dict.teardown.lumiCta}
                </GenieOpenButton>
                <p className="cs-consent-note" style={{ marginTop: "var(--cs-space-md)", marginBottom: 0 }}>
                  {dict.genie.consent}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
