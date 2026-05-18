import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export type ScrollDirection = 'up' | 'down' | 'idle';

export type ScrollState = {
  velocity: number;
  direction: ScrollDirection;
  lastScrollTop: number;
  setScrollSnapshot: (scrollTop: number, velocity: number) => void;
  setIdle: () => void;
};

export const useScrollStore = create<ScrollState>()(
  subscribeWithSelector(
    devtools(
      (set): ScrollState => ({
        velocity: 0,
        direction: 'idle',
        lastScrollTop: 0,
        setScrollSnapshot: (scrollTop, velocity): void =>
          set((state): Partial<ScrollState> => ({
            velocity,
            direction: directionFrom(scrollTop, state.lastScrollTop, velocity),
            lastScrollTop: scrollTop,
          })),
        setIdle: (): void => set({ velocity: 0, direction: 'idle' }),
      }),
      { name: 'scroll-store', enabled: process.env.NODE_ENV !== 'production' },
    ),
  ),
);

function directionFrom(scrollTop: number, previous: number, velocity: number): ScrollDirection {
  if (Math.abs(velocity) < 0.01 || scrollTop === previous) return 'idle';
  return scrollTop > previous ? 'down' : 'up';
}
