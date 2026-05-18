'use client';
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { hasWebGL2 } from '@/lib/feature-detect';
import { onIdle, postTask } from '@/lib/perf/scheduler';
import { CanvasLoadingFallback } from '@/components/canvas/CanvasLoadingFallback';
import { CanvasMount } from '@/lib/dynamic-three';

type CanvasErrorBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError();
    if (process.env.NODE_ENV !== 'test') {
      console.warn('GlobalCanvas disabled after renderer failure', error.message, errorInfo.componentStack);
    }
  }

  override render() {
    if (this.state.failed) return <CanvasLoadingFallback />;
    return this.props.children;
  }
}

export function GlobalCanvasShell() {
  const [shouldMount, setShouldMount] = useState(false);
  const [mountFailed, setMountFailed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname === '/lite') {
      setShouldMount(false);
      return;
    }
    if (!hasWebGL2()) {
      setShouldMount(false);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShouldMount(false);
      return;
    }

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setShouldMount(true);
    };
    const cancelIdle = onIdle(() => {
      void postTask(mount, 'user-visible');
    }, 500);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [pathname]);

  if (pathname === '/lite') return null;
  if (!shouldMount || mountFailed) return <CanvasLoadingFallback />;
  return (
    <CanvasErrorBoundary onError={() => setMountFailed(true)}>
      <CanvasMount />
    </CanvasErrorBoundary>
  );
}
