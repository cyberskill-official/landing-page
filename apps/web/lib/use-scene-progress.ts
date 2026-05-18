'use client';

import { createContext, createElement, useContext } from 'react';
import type { ReactNode } from 'react';

export type SceneProgressContextValue = {
  progress: number;
  culled: boolean;
  sceneId: string | null;
};

const defaultValue: SceneProgressContextValue = {
  progress: 0,
  culled: true,
  sceneId: null,
};

const SceneProgressContext = createContext<SceneProgressContextValue>(defaultValue);

export function SceneProgressProvider({
  value,
  children,
}: {
  value: SceneProgressContextValue;
  children: ReactNode;
}) {
  return createElement(SceneProgressContext.Provider, { value }, children);
}

export function useSceneProgress(): number {
  return useContext(SceneProgressContext).progress;
}

export function useSceneProgressState(): SceneProgressContextValue {
  return useContext(SceneProgressContext);
}
