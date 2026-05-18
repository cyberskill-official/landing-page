import { SmoothScrollProviderClient } from './SmoothScrollProvider.client';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <SmoothScrollProviderClient>{children}</SmoothScrollProviderClient>;
}
