'use client';

import { useCallback, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { resetLumiIdle, setCurrentAnim, useLowMemoryMode, type AnimationClipName, type CtaTrack } from '@/lib/stores';

export type LumiFormSubmitStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error'
  | 'error_retry'
  | 'error_validation'
  | 'error_rate';

export type LumiFormReactionTrigger = 'mount' | 'step_advance' | 'submit_success' | 'submit_error' | 'close';

export type LumiFormReaction = {
  animation: AnimationClipName;
  priority: number;
  restoreIdleAfterMs?: number;
  trigger: LumiFormReactionTrigger;
};

export type LumiFormReactionOptions = {
  currentStep?: number | string;
  submitStatus?: LumiFormSubmitStatus;
  track: CtaTrack;
};

const STEP_DEBOUNCE_MS = 200;
const WAVE_GOODBYE_MS = 2_500;

export function resolveLumiFormReaction(trigger: LumiFormReactionTrigger): LumiFormReaction {
  if (trigger === 'mount') return { animation: 'mouth_smile', priority: 30, trigger };
  if (trigger === 'step_advance') return { animation: 'summon', priority: 40, trigger };
  if (trigger === 'submit_success') {
    return {
      animation: 'wave_goodbye',
      priority: 60,
      restoreIdleAfterMs: WAVE_GOODBYE_MS,
      trigger,
    };
  }
  if (trigger === 'submit_error') return { animation: 'idle_concerned', priority: 50, trigger };
  return { animation: 'idle', priority: 20, trigger };
}

export function useLumiFormReactions({ currentStep, submitStatus = 'idle', track }: LumiFormReactionOptions) {
  const lowMemoryMode = useLowMemoryMode();
  const reducedMotion = useReducedMotion();
  const disabled = lowMemoryMode || reducedMotion;
  const lastStepRef = useRef<string | undefined>(currentStep == null ? undefined : String(currentStep));
  const lastStatusRef = useRef<LumiFormSubmitStatus>('idle');
  const stepTimerRef = useRef<number | null>(null);
  const restoreTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (stepTimerRef.current !== null) window.clearTimeout(stepTimerRef.current);
    if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current);
    stepTimerRef.current = null;
    restoreTimerRef.current = null;
  }, []);

  const fire = useCallback(
    (trigger: LumiFormReactionTrigger) => {
      if (disabled) return false;

      const reaction = resolveLumiFormReaction(trigger);
      const accepted = setCurrentAnim(reaction.animation, reaction.priority);
      if (!accepted) return false;

      trackEvent('lumi_form_reaction_fired', {
        anim: reaction.animation,
        form_track: track,
        trigger,
      });

      if (reaction.restoreIdleAfterMs) {
        if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = window.setTimeout(() => {
          resetLumiIdle();
          trackEvent('lumi_form_reaction_fired', {
            anim: 'idle',
            form_track: track,
            trigger: 'close',
          });
        }, reaction.restoreIdleAfterMs);
      }

      return true;
    },
    [disabled, track],
  );

  useEffect(() => {
    fire('mount');
    return () => {
      clearTimers();
      if (!disabled) resetLumiIdle();
    };
  }, [clearTimers, disabled, fire]);

  useEffect(() => {
    const nextStep = currentStep == null ? undefined : String(currentStep);
    if (nextStep === undefined) return;

    if (lastStepRef.current === undefined) {
      lastStepRef.current = nextStep;
      return;
    }

    if (nextStep === lastStepRef.current) return;
    lastStepRef.current = nextStep;

    if (disabled) return;
    if (stepTimerRef.current !== null) window.clearTimeout(stepTimerRef.current);
    stepTimerRef.current = window.setTimeout(() => {
      stepTimerRef.current = null;
      fire('step_advance');
    }, STEP_DEBOUNCE_MS);
  }, [currentStep, disabled, fire]);

  useEffect(() => {
    if (submitStatus === lastStatusRef.current) return;
    lastStatusRef.current = submitStatus;

    if (submitStatus === 'success') {
      fire('submit_success');
      return;
    }

    if (submitStatus === 'error' || submitStatus.startsWith('error_')) {
      fire('submit_error');
    }
  }, [fire, submitStatus]);

  return { disabled };
}
