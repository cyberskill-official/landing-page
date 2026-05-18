'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { configureGltfDecoders } from '@/lib/canvas/decoder-config';

export function DecoderBootstrap() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    void configureGltfDecoders(gl);
  }, [gl]);

  return null;
}
