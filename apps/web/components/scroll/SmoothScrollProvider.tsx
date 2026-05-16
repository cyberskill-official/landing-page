'use client';
import { useEffect } from 'react';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // FR-WEB-002: Lenis init goes here
  }, []);
  return <>{children}</>;
}
