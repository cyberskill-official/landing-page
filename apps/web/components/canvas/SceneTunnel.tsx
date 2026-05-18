import { SceneTunnelClient } from './SceneTunnel.client';
import type { SceneTunnelProps } from './SceneTunnel.client';

export type { SceneTunnelProps };

export function SceneTunnel(props: SceneTunnelProps) {
  return <SceneTunnelClient {...props} />;
}
