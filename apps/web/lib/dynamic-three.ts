import dynamic from 'next/dynamic';
import { createElement } from 'react';
import { CanvasLoadingFallback } from '@/components/canvas/CanvasLoadingFallback';
import type {
  DynamicCanvasMountComponent,
  DynamicSceneTunnelComponent,
} from './dynamic-three.types';

export const CanvasMount: DynamicCanvasMountComponent = dynamic(
  () => import('@/components/canvas/CanvasMount').then((module) => module.default),
  {
    ssr: false,
    loading: () => createElement(CanvasLoadingFallback),
  },
);

export const SceneTunnel: DynamicSceneTunnelComponent = dynamic(
  () => import('@/components/canvas/SceneTunnel.client').then((module) => module.SceneTunnelClient),
  {
    ssr: false,
    loading: () => null,
  },
);

export const DynamicCanvasMount = CanvasMount;

export function loadLenisScrollTriggerBridge() {
  return import('@/lib/lenis-scrolltrigger-bridge');
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}
