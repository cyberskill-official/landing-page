import { describe, expect, test } from 'vitest';
import { findUndisposedThreeRefs } from '../no-undisposed-three-ref';

describe('FR-PERF-005 no-undisposed-three-ref rule', () => {
  test('flags Three refs that are not passed to useDisposeOnUnmount', () => {
    const violations = findUndisposedThreeRefs(`
      import { useRef } from 'react';
      import type { BufferGeometry } from 'three';

      export function MeshThing() {
        const geometryRef = useRef<BufferGeometry | null>(null);
        return null;
      }
    `);

    expect(violations).toEqual([
      expect.objectContaining({ refName: 'geometryRef', typeName: 'BufferGeometry' }),
    ]);
  });

  test('accepts refs cleaned by the dispose hook', () => {
    const violations = findUndisposedThreeRefs(`
      import { useRef } from 'react';
      import type { Group, MeshStandardMaterial } from 'three';
      import { useDisposeOnUnmount } from '@/lib/three/use-dispose-on-unmount';

      export function MeshThing() {
        const rootRef = useRef<Group | null>(null);
        const materialRef = useRef<MeshStandardMaterial | null>(null);
        useDisposeOnUnmount([rootRef, materialRef]);
        return null;
      }
    `);

    expect(violations).toEqual([]);
  });

  test('ignores test fixtures', () => {
    const violations = findUndisposedThreeRefs(
      `
        import { useRef } from 'react';
        import type { Texture } from 'three';
        const textureRef = useRef<Texture | null>(null);
      `,
      '/tmp/project/__tests__/fixture.tsx',
    );

    expect(violations).toEqual([]);
  });
});
