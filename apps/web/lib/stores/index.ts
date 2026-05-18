import { useShallow } from 'zustand/react/shallow';
import { useSceneStore } from './sceneStore';
import { useLumiStore } from './lumiStore';
import { useScrollStore } from './scrollStore';
import { useAudioStore } from './audioStore';
import type { AnimationClipName, CtaTrack, Vec3 } from './lumiStore';
import type { ScrollDirection } from './scrollStore';

export const useActiveScene = (): number => useSceneStore((state) => state.activeScene);
export const useLowMemoryMode = (): boolean => useSceneStore((state) => state.lowMemoryMode);
export const useSceneProgressValue = (id: string): number =>
  useSceneStore((state) => state.sceneProgress[id] ?? 0);
export const useTransitioning = (): boolean => useSceneStore((state) => state.transitioning);

export const useLumiPosition = (): Vec3 => useLumiStore(useShallow((state) => state.position));
export const useLumiLookAt = (): Vec3 => useLumiStore(useShallow((state) => state.lookAt));
export const useLumiAnim = (): AnimationClipName => useLumiStore((state) => state.currentAnim);
export const useNonlaVisible = (): boolean => useLumiStore((state) => state.nonlaVisible);
export const useFocusedCta = (): CtaTrack | null => useLumiStore((state) => state.focusedCta);
export const useEmissiveBoost = (): number => useLumiStore((state) => state.emissiveBoost);

export const useScrollVelocity = (): number => useScrollStore((state) => state.velocity);
export const useScrollDirection = (): ScrollDirection => useScrollStore((state) => state.direction);
export const useMuted = (): boolean => useAudioStore((state) => state.muted);

export const setActiveScene = (scene: number): void => useSceneStore.getState().setActiveScene(scene);
export const setLowMemoryMode = (enabled: boolean): void =>
  useSceneStore.getState().setLowMemoryMode(enabled);
export const setSceneProgress = (id: string, progress: number): void =>
  useSceneStore.getState().setSceneProgress(id, progress);
export const setTransitioning = (transitioning: boolean): void =>
  useSceneStore.getState().setTransitioning(transitioning);
export const setCurrentAnim = (animation: AnimationClipName, priority?: number): boolean =>
  useLumiStore.getState().setCurrentAnim(animation, priority);
export const resetLumiIdle = (): void => useLumiStore.getState().resetIdle();
export const setFocusedCta = (track: CtaTrack | null): void =>
  useLumiStore.getState().setFocusedCta(track);
export const setNonlaVisible = (visible: boolean): void =>
  useLumiStore.getState().setNonlaVisible(visible);
export const setEmissiveBoost = (boost: number): void =>
  useLumiStore.getState().setEmissiveBoost(boost);
export const setScrollSnapshot = (scrollTop: number, velocity: number): void =>
  useScrollStore.getState().setScrollSnapshot(scrollTop, velocity);
export const setMuted = (muted: boolean): void => useAudioStore.getState().setMuted(muted);

export type { AnimationClipName, CtaTrack, Vec3, ScrollDirection };
