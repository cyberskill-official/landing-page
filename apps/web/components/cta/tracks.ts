import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { CtaTrack } from '@/lib/stores';

export type TrackId = CtaTrack;

export type TrackFormProps = {
  onClose: () => void;
};

export type Track = {
  id: TrackId;
  label: string;
  eyebrow: string;
  subhead: string;
  describedBy: string;
  primaryAction: string;
  paletteRole: 'primary' | 'secondary' | 'tertiary';
  formFactory: () => LazyExoticComponent<ComponentType<TrackFormProps>>;
};

export const TRACKS = [
  {
    id: 'buy',
    label: 'Book a Discovery Call',
    eyebrow: 'Buy',
    subhead: 'For builders who need senior partners.',
    describedBy:
      'For enterprise and SMB buyers who need a senior, English-fluent software partner without paying North America prices.',
    primaryAction: 'Open discovery flow',
    paletteRole: 'primary',
    formFactory: () => lazy(() => import('./forms/BuyForm')),
  },
  {
    id: 'partner',
    label: 'Partner With Us',
    eyebrow: 'Partner',
    subhead: 'For agencies seeking white-label and co-delivery.',
    describedBy:
      'For agencies and product studios that need a Vietnam-based delivery partner for React, Three.js, AI, and design-system work.',
    primaryAction: 'Open partner flow',
    paletteRole: 'secondary',
    formFactory: () => lazy(() => import('./forms/PartnerForm')),
  },
  {
    id: 'join',
    label: 'Join the Team',
    eyebrow: 'Join',
    subhead: 'For senior craftspeople, remote-first.',
    describedBy:
      'For senior engineers and designers who want a craft-led Vietnamese team, strong technical peers, and founder-accessible work.',
    primaryAction: 'Open join flow',
    paletteRole: 'tertiary',
    formFactory: () => lazy(() => import('./forms/JoinForm')),
  },
] as const satisfies readonly Track[];

export function isTrackId(value: string | null): value is TrackId {
  return value === 'buy' || value === 'partner' || value === 'join';
}

export function trackById(trackId: TrackId) {
  return TRACKS.find((track) => track.id === trackId);
}
