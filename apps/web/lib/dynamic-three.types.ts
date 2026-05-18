import type { ComponentType } from 'react';
import type { SceneTunnelProps } from '@/components/canvas/SceneTunnel.client';

export type CanvasMountProps = Record<string, never>;
export type DynamicCanvasMountComponent = ComponentType<CanvasMountProps>;
export type DynamicSceneTunnelComponent = ComponentType<SceneTunnelProps>;
export type { SceneTunnelProps };
