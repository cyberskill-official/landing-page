'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  useActiveScene,
  useLumiAnim,
  useScrollVelocity,
  useTransitioning,
  type AnimationClipName,
} from '@/lib/stores';

export const FRAMELOOP_IDLE_TAIL_MS = 500;

export function useFrameloopController() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  const activeScene = useActiveScene();
  const currentAnim = useLumiAnim();
  const transitioning = useTransitioning();
  const scrollVelocity = useScrollVelocity();
  const needsContinuousFrames =
    isContinuousLumiAnimation(currentAnim) ||
    transitioning ||
    Math.abs(scrollVelocity) > 0.1 ||
    sceneHasContinuousParticles(activeScene);

  useEffect(() => {
    invalidate();
    if (needsContinuousFrames) {
      setFrameloop('always');
      return undefined;
    }

    const timer = window.setTimeout(() => setFrameloop('demand'), FRAMELOOP_IDLE_TAIL_MS);
    return () => window.clearTimeout(timer);
  }, [invalidate, needsContinuousFrames, setFrameloop]);

  useEffect(() => {
    invalidate();
  }, [activeScene, currentAnim, invalidate, transitioning]);
}

export function isContinuousLumiAnimation(animation: AnimationClipName): boolean {
  return animation !== 'idle' && animation !== 'idle_concerned' && animation !== 'coil_idle';
}

export function sceneHasContinuousParticles(sceneIndex: number): boolean {
  return sceneIndex === 0;
}
