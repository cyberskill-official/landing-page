import React from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { HiringBadge } from '@/components/footer/HiringBadge';
import { LanguageSwitcher } from './LanguageSwitcher';

type TrustSignalsFooterProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    caption: 'Until your next wish.',
    contact: 'Contact',
    navigation: 'Navigation',
    legitimacy: 'Legitimacy',
    founded: 'Founded 2020',
    founder: 'Founder: Stephen Cheng · Trịnh Thái Anh',
    work: 'Work',
    lite: 'Lite mode',
    accessibility: 'Accessibility',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  vi: {
    caption: 'Until your next wish.',
    contact: 'Lien he',
    navigation: 'Dieu huong',
    legitimacy: 'Tin cay',
    founded: 'Thanh lap nam 2020',
    founder: 'Nguoi sang lap: Stephen Cheng · Trịnh Thái Anh',
    work: 'Du an',
    lite: 'Che do nhe',
    accessibility: 'Tro nang truy cap',
    privacy: 'Quyen rieng tu',
    terms: 'Dieu khoan',
  },
} as const;

export function TrustSignalsFooter({ locale }: TrustSignalsFooterProps) {
  const messages = copy[locale];

  return (
    <footer className="site-footer" aria-label="Site footer">
      <p className="site-footer__caption">{messages.caption}</p>
      <div className="site-footer__grid">
        <section aria-labelledby="footer-legitimacy-title">
          <h2 id="footer-legitimacy-title">{messages.legitimacy}</h2>
          <p className="site-footer__legal-name">
            CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY
          </p>
          <p>
            <a
              href="https://www.dnb.com/business-directory/company-profiles.cyberskill.673219568.html"
              rel="external"
            >
              D-U-N-S 673219568
            </a>
          </p>
          <p>{messages.founded}</p>
          <p>{messages.founder}</p>
        </section>
        <section aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">{messages.contact}</h2>
          <address>
            1st Floor, 207A Nguyen Van Thu Street,
            <br />
            Tan Dinh Ward, Ho Chi Minh City, Vietnam
            <br />
            <a href="tel:+84906878091">(+84) 906 878 091</a>
            <br />
            <a href="mailto:info@cyberskill.world">info@cyberskill.world</a>
          </address>
        </section>
        <nav aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title">{messages.navigation}</h2>
          <div className="site-footer__links">
            <a href="/work">{messages.work}</a>
            <a href="/lite">{messages.lite}</a>
            <a href="/accessibility">{messages.accessibility}</a>
            <a href="/privacy">{messages.privacy}</a>
            <a href="/terms">{messages.terms}</a>
          </div>
          <HiringBadge />
          <LanguageSwitcher locale={locale} />
        </nav>
      </div>
    </footer>
  );
}
