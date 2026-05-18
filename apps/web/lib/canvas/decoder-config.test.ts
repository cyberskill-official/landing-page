import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  DECODER_PATHS,
  areDecoderPathsConfigured,
  configureGltfDecoders,
  preloadGltfWithLocalDecoders,
  resetDecoderConfigForTests,
} from './decoder-config';

const mocks = vi.hoisted(() => {
  const useGLTF = {
    preload: vi.fn(),
    setDecoderPath: vi.fn(),
    setMeshoptDecoder: vi.fn(),
    setKTX2Loader: vi.fn(),
  };

  class KTX2Loader {
    setTranscoderPath = vi.fn(() => this);
    detectSupport = vi.fn(() => this);
  }

  return { useGLTF, KTX2Loader };
});

vi.mock('@react-three/drei', () => ({ useGLTF: mocks.useGLTF }));
vi.mock('three/examples/jsm/loaders/KTX2Loader.js', () => ({ KTX2Loader: mocks.KTX2Loader }));

describe('FR-OPS-005 decoder config', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    resetDecoderConfigForTests();
  });

  test('uses same-origin decoder paths', () => {
    expect(DECODER_PATHS).toEqual({
      draco: '/decoders/draco/',
      basis: '/decoders/basis/',
      meshoptModule: '/decoders/meshopt/meshopt_decoder.module.js',
    });
  });

  test('configures Drei GLTF decoders lazily with a renderer', async () => {
    const meshoptDecoder = { mocked: true, decoder: 'meshopt' };
    vi.stubGlobal('__cyberskillMeshoptDecoderForTests', meshoptDecoder);

    await configureGltfDecoders({} as never);

    expect(mocks.useGLTF.setDecoderPath).toHaveBeenCalledWith('/decoders/draco/');
    expect(mocks.useGLTF.setMeshoptDecoder).toHaveBeenCalledWith(meshoptDecoder);
    expect(mocks.useGLTF.setKTX2Loader).toHaveBeenCalledWith(expect.any(mocks.KTX2Loader));
    expect(areDecoderPathsConfigured()).toBe(true);
  });

  test('preload helper configures decoders before preloading the GLB', async () => {
    const meshoptDecoder = { mocked: true, decoder: 'meshopt' };
    vi.stubGlobal('__cyberskillMeshoptDecoderForTests', meshoptDecoder);

    await preloadGltfWithLocalDecoders('/scene-0.glb');

    expect(mocks.useGLTF.setDecoderPath).toHaveBeenCalledWith('/decoders/draco/');
    expect(mocks.useGLTF.setMeshoptDecoder).toHaveBeenCalledWith(meshoptDecoder);
    expect(mocks.useGLTF.preload).toHaveBeenCalledWith('/scene-0.glb');
  });
});
