'use client';

import { useAnimations } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { AnimationAction, AnimationClip, Event, Object3D } from 'three';
import { LoopOnce } from 'three';
import { duration, ease } from '@cyberskill/ds-cinematic/tokens/motion';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { disposeMixer } from '@/lib/scene-disposal';
import { setCurrentAnim, useLumiAnim, type AnimationClipName } from '@/lib/stores';

export type LumiAnimationsProps = {
  rootBone: Object3D;
  animations: AnimationClip[];
};

export const NON_LOOP_LUMI_CLIPS = new Set<AnimationClipName>([
  'fly_in',
  'point',
  'summon',
  'wave',
  'split_to_4',
  'wave_goodbye',
  'nonla_appear',
  'nonla_tip',
]);

const ALL_LUMI_CLIPS = new Set<AnimationClipName>([
  'idle',
  'fly_in',
  'mouth_smile',
  'point',
  'summon',
  'wave',
  'coil_idle',
  'paint',
  'split_to_4',
  'wave_goodbye',
  'nonla_appear',
  'nonla_tip',
]);

export const LUMI_CROSSFADE_EASE = ease.genie;
export const LUMI_CROSSFADE_DURATION_MS = duration.swift - duration.instant / 2;
export const LUMI_CROSSFADE_DURATION_SECONDS = LUMI_CROSSFADE_DURATION_MS / 1_000;

type LumiAnimationEvent = {
  event: 'lumi_animation_transition' | 'lumi_animation_missing_clip' | 'lumi_animation_finished';
  currentAnim: AnimationClipName;
  previousAnim?: AnimationClipName | null;
  reducedMotion?: boolean;
  crossfadeMs?: number;
  timestamp: number;
};

declare global {
  interface Window {
    __lumiAnimationEvents?: LumiAnimationEvent[];
  }
}

export function useLumiAnimations({ rootBone, animations }: LumiAnimationsProps) {
  const { actions, mixer } = useAnimations(animations, rootBone);
  const currentAnim = useLumiAnim();
  const reducedMotion = useReducedMotion();
  const previousAnim = useRef<AnimationClipName | null>(null);

  const actionNames = useMemo(() => new Set(Object.keys(actions)), [actions]);

  useEffect(() => {
    const newAction = actions[currentAnim] ?? null;
    const oldAction = previousAnim.current ? actions[previousAnim.current] ?? null : null;

    if (!newAction) {
      recordLumiAnimationEvent({
        event: 'lumi_animation_missing_clip',
        currentAnim,
        previousAnim: previousAnim.current,
        timestamp: Date.now(),
      });
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[FR-SCENE-010] no action for clip ${currentAnim}`);
      }
      return;
    }

    prepareAction(newAction, currentAnim);

    if (oldAction && oldAction !== newAction) {
      if (reducedMotion) {
        newAction.play();
        oldAction.stop();
      } else {
        newAction.play().crossFadeFrom(oldAction, LUMI_CROSSFADE_DURATION_SECONDS, false);
      }
    } else {
      newAction.play();
    }

    recordLumiAnimationEvent({
      event: 'lumi_animation_transition',
      currentAnim,
      previousAnim: previousAnim.current,
      reducedMotion,
      crossfadeMs: reducedMotion ? 0 : LUMI_CROSSFADE_DURATION_MS,
      timestamp: Date.now(),
    });
    previousAnim.current = currentAnim;
  }, [actions, actionNames, currentAnim, reducedMotion]);

  useEffect(() => {
    const onFinished = (event: Event & { action?: AnimationAction }) => {
      const finishedClipName = event.action?.getClip().name;
      if (!isAnimationClipName(finishedClipName) || !NON_LOOP_LUMI_CLIPS.has(finishedClipName)) return;

      recordLumiAnimationEvent({
        event: 'lumi_animation_finished',
        currentAnim: finishedClipName,
        timestamp: Date.now(),
      });
      setCurrentAnim('idle');
    };

    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
  }, [mixer]);

  useEffect(() => () => disposeMixer(mixer, rootBone), [mixer, rootBone]);

  return { actions, mixer };
}

function prepareAction(action: AnimationAction, clipName: AnimationClipName) {
  action.reset();
  if (NON_LOOP_LUMI_CLIPS.has(clipName)) {
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
  }
}

function isAnimationClipName(value: string | undefined): value is AnimationClipName {
  return Boolean(value && ALL_LUMI_CLIPS.has(value as AnimationClipName));
}

function recordLumiAnimationEvent(event: LumiAnimationEvent) {
  if (typeof window === 'undefined') return;
  window.__lumiAnimationEvents = window.__lumiAnimationEvents ?? [];
  window.__lumiAnimationEvents.push(event);
}
