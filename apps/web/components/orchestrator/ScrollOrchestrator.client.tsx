'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis, useLenis } from '@/lib/lenis-singleton';
import { setActiveScene, setSceneProgress, setTransitioning } from '@/lib/stores';
import {
  DEFAULT_SCENE_RANGE,
  SCENE_RANGES,
  getActiveSceneFromScrollY,
  getIntersectingSceneId,
  getSceneProgressMap,
  type SceneRange,
} from './scene-timeline';
import { getActiveSceneRanges } from './MobileSceneFlow';
import { MOBILE_BREAKPOINT_QUERY } from './mobile-scene-ranges';

gsap.registerPlugin(ScrollTrigger);

type OrchestratorDebugState = {
  scene: string;
  progress: number;
  transitioning: boolean;
};

export function ScrollOrchestratorClient() {
  const lenis = useLenis();
  const lastSceneRef = useRef<string>(DEFAULT_SCENE_RANGE.id);
  const transitionTimerRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [sceneRanges, setSceneRanges] = useState<readonly SceneRange[]>(SCENE_RANGES);
  const [debugState, setDebugState] = useState<OrchestratorDebugState>({
    scene: DEFAULT_SCENE_RANGE.id,
    progress: 0,
    transitioning: false,
  });

  useEffect(() => {
    document.body.dataset.scene = DEFAULT_SCENE_RANGE.id;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'orchestrator');
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const update = () => setSceneRanges(getActiveSceneRanges(query.matches));
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const updateProgressFromScroll = () => {
      const scrollY = getLenis()?.scroll ?? window.scrollY;
      const viewportHeight = window.innerHeight || 1;
      const activeRange = getActiveSceneFromScrollY(scrollY, viewportHeight, sceneRanges);
      const activeSceneId = activeRange.id;
      applyScene(activeSceneId);
      const progressMap = getSceneProgressMap(scrollY, viewportHeight, sceneRanges);
      for (const range of sceneRanges) {
        setSceneProgress(range.id, progressMap[range.id] ?? 0);
      }
      setDebugState({
        scene: activeSceneId,
        progress: progressMap[activeSceneId] ?? 0,
        transitioning: activeSceneId !== lastSceneRef.current,
      });
    };

    if (reducedMotion) return;

    const triggers = sceneRanges.map((range) => {
      const trigger = document.querySelector(`[data-scene-id="${range.id}"]`);
      if (!trigger) return null;
      return ScrollTrigger.create({
        trigger,
        scroller: document.body,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => applyScene(range.id),
        onEnterBack: () => applyScene(range.id),
        onUpdate: (self) => setSceneProgress(range.id, self.progress),
      });
    });

    window.addEventListener('scroll', updateProgressFromScroll, { passive: true });
    updateProgressFromScroll();
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('scroll', updateProgressFromScroll);
      for (const trigger of triggers) trigger?.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, [lenis, reducedMotion, sceneRanges]);

  useEffect(() => {
    if (!reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const sceneId = getIntersectingSceneId(entries);
        if (!sceneId) return;
        applyScene(sceneId);
        setSceneProgress(sceneId, 1);
        setDebugState({ scene: sceneId, progress: 1, transitioning: sceneId !== lastSceneRef.current });
      },
      { threshold: [0, 0.5, 1] },
    );

    document.querySelectorAll('[data-scene-id]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [reducedMotion]);

  function applyScene(sceneId: string) {
    const range = sceneRanges.find((candidate) => candidate.id === sceneId) ?? DEFAULT_SCENE_RANGE;
    if (lastSceneRef.current !== sceneId) {
      setTransitioning(true);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => setTransitioning(false), 500);
    }
    lastSceneRef.current = sceneId;
    document.body.dataset.scene = sceneId;
    setActiveScene(range.index);
  }

  if (!debugEnabled || process.env.NODE_ENV === 'production') return null;

  return (
    <output
      aria-label="Orchestrator debug"
      data-orchestrator-debug
      style={{
        position: 'fixed',
        left: 12,
        top: 72,
        zIndex: 50,
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        background: 'rgba(12, 13, 18, 0.82)',
        color: 'white',
        font: '12px/1.4 monospace',
        pointerEvents: 'none',
      }}
    >
      scene: {debugState.scene} | progress: {debugState.progress.toFixed(2)} | transitioning:{' '}
      {String(debugState.transitioning)}
    </output>
  );
}
