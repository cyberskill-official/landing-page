import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export type AnimationClipName =
  | 'idle'
  | 'idle_concerned'
  | 'fly_in'
  | 'mouth_smile'
  | 'point'
  | 'summon'
  | 'wave'
  | 'coil_idle'
  | 'paint'
  | 'split_to_4'
  | 'wave_goodbye'
  | 'nonla_appear'
  | 'nonla_tip';

export type CtaTrack = 'buy' | 'partner' | 'join';
export type Vec3 = [number, number, number];

export type QueuedLumiAnimation = {
  animation: AnimationClipName;
  priority: number;
  startedAt: number;
};

export type LumiState = {
  currentAnim: AnimationClipName;
  currentPriority: number;
  queue: QueuedLumiAnimation[];
  position: Vec3;
  lookAt: Vec3;
  nonlaVisible: boolean;
  focusedCta: CtaTrack | null;
  emissiveBoost: number;
  setCurrentAnim: (animation: AnimationClipName, priority?: number) => boolean;
  resetIdle: () => void;
  setPosition: (position: Vec3) => void;
  setLookAt: (lookAt: Vec3) => void;
  setNonlaVisible: (visible: boolean) => void;
  setFocusedCta: (track: CtaTrack | null) => void;
  setEmissiveBoost: (boost: number) => void;
};

export const useLumiStore = create<LumiState>()(
  subscribeWithSelector(
    devtools(
      (set): LumiState => ({
        currentAnim: 'idle',
        currentPriority: 0,
        queue: [],
        position: [0, 0, 0],
        lookAt: [0, 0, -1],
        nonlaVisible: false,
        focusedCta: null,
        emissiveBoost: 0.1,
        setCurrentAnim: (animation, priority = 0): boolean => {
          let accepted = false;
          set((state): Partial<LumiState> => {
            if (priority < state.currentPriority) {
              return {
                queue: [
                  ...state.queue,
                  {
                    animation,
                    priority,
                    startedAt: Date.now(),
                  },
                ],
              };
            }

            accepted = true;
            return { currentAnim: animation, currentPriority: priority };
          });
          return accepted;
        },
        resetIdle: (): void => set({ currentAnim: 'idle', currentPriority: 0, queue: [] }),
        setPosition: (position): void => set({ position }),
        setLookAt: (lookAt): void => set({ lookAt }),
        setNonlaVisible: (visible): void => set({ nonlaVisible: visible }),
        setFocusedCta: (track): void => set({ focusedCta: track }),
        setEmissiveBoost: (boost): void => set({ emissiveBoost: clamp01(boost) }),
      }),
      { name: 'lumi-store', enabled: process.env.NODE_ENV !== 'production' },
    ),
  ),
);

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
