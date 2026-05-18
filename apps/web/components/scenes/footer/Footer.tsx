import React, { type ReactNode } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { FounderPersonJsonLd } from '@/components/seo/PersonJsonLd';
import { FooterClient } from './Footer.client';
import { TrustSignalsFooter } from './TrustSignalsFooter';

type FooterProps = {
  locale: SupportedLocale;
  children?: ReactNode;
};

export function Footer({ locale, children }: FooterProps) {
  return (
    <FooterClient locale={locale}>
      <FounderPersonJsonLd />
      <TrustSignalsFooter locale={locale} />
      {children}
    </FooterClient>
  );
}
