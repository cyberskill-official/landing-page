'use client';

import type { WebGLRenderer } from 'three';

export const DECODER_PATHS = {
  draco: '/decoders/draco/',
  basis: '/decoders/basis/',
  meshoptModule: '/decoders/meshopt/meshopt_decoder.module.js',
} as const;

type ConfigurableUseGLTF = {
  preload: (path: string) => void;
  setDecoderPath?: (path: string) => void;
  setMeshoptDecoder?: (decoder: unknown) => void;
  setKTX2Loader?: (loader: unknown) => void;
};

declare global {
  interface Window {
    __cyberskillDecoderEvents?: Array<{
      event: string;
      detail: Record<string, string | boolean>;
    }>;
  }

  // Test-only override so Vitest can exercise decoder wiring without importing
  // a browser-served module from /public.
  var __cyberskillMeshoptDecoderForTests: unknown | undefined;
}

let meshoptDecoderPromise: Promise<unknown> | null = null;
let ktx2Loader: unknown | null = null;
let decoderPathsConfigured = false;

function recordDecoderEvent(event: string, detail: Record<string, string | boolean>) {
  if (typeof window === 'undefined') return;

  window.__cyberskillDecoderEvents = window.__cyberskillDecoderEvents ?? [];
  window.__cyberskillDecoderEvents.push({ event, detail });

  if (process.env.NODE_ENV !== 'production') {
    console.info(JSON.stringify({ event, ...detail }));
  }
}

async function loadMeshoptDecoder() {
  if (globalThis.__cyberskillMeshoptDecoderForTests) {
    return globalThis.__cyberskillMeshoptDecoderForTests;
  }

  meshoptDecoderPromise =
    meshoptDecoderPromise ??
    import(/* webpackIgnore: true */ DECODER_PATHS.meshoptModule).then((module) => {
      const decoderModule = module as { MeshoptDecoder?: unknown; default?: unknown };
      return decoderModule.MeshoptDecoder ?? decoderModule.default;
    });

  return meshoptDecoderPromise;
}

export async function configureGltfDecoders(renderer?: WebGLRenderer) {
  const { useGLTF } = (await import('@react-three/drei')) as { useGLTF: ConfigurableUseGLTF };

  useGLTF.setDecoderPath?.(DECODER_PATHS.draco);
  decoderPathsConfigured = true;

  const meshoptDecoder = await loadMeshoptDecoder();
  if (meshoptDecoder) {
    useGLTF.setMeshoptDecoder?.(meshoptDecoder);
  }

  if (renderer && !ktx2Loader && typeof useGLTF.setKTX2Loader === 'function') {
    const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js');
    ktx2Loader = new KTX2Loader().setTranscoderPath(DECODER_PATHS.basis).detectSupport(renderer);
    useGLTF.setKTX2Loader(ktx2Loader);
  }

  recordDecoderEvent('decoders_configured', {
    draco: DECODER_PATHS.draco,
    basis: DECODER_PATHS.basis,
    meshopt: DECODER_PATHS.meshoptModule,
    ktx2: String(Boolean(ktx2Loader)),
  });

  return useGLTF;
}

export async function preloadGltfWithLocalDecoders(path: string) {
  const useGLTF = await configureGltfDecoders();
  useGLTF.preload(path);
}

export function areDecoderPathsConfigured() {
  return decoderPathsConfigured;
}

export function resetDecoderConfigForTests() {
  meshoptDecoderPromise = null;
  ktx2Loader = null;
  decoderPathsConfigured = false;
}
