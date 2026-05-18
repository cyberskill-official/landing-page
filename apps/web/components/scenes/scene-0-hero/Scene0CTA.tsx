import React from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { Scene0CTAClient } from './Scene0CTA.client';

export function Scene0CTA({ locale }: { locale: SupportedLocale }) {
  return <Scene0CTAClient locale={locale} />;
}
