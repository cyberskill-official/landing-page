import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export type SceneState = {
  activeScene: number;
  lowMemoryMode: boolean;
  sceneProgress: Record<string, number>;
  transitioning: boolean;
  setActiveScene: (scene: number) => void;
  setLowMemoryMode: (enabled: boolean) => void;
  setSceneProgress: (id: string, progress: number) => void;
  setTransitioning: (transitioning: boolean) => void;
};

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector(
    devtools(
      (set): SceneState => ({
        activeScene: 0,
        lowMemoryMode: false,
        sceneProgress: {},
        transitioning: false,
        setActiveScene: (scene): void => set({ activeScene: scene }),
        setLowMemoryMode: (enabled): void => set({ lowMemoryMode: enabled }),
        setSceneProgress: (id, progress): void =>
          set((state): Partial<SceneState> => ({
            sceneProgress: {
              ...state.sceneProgress,
              [id]: clampProgress(progress),
            },
          })),
        setTransitioning: (transitioning): void => set({ transitioning }),
      }),
      { name: 'scene-store', enabled: process.env.NODE_ENV !== 'production' },
    ),
  ),
);

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}
