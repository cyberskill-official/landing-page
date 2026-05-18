import { describe, expect, test } from 'vitest';
import {
  ALLOC_CLASSES,
  buildUseMemoReplacement,
  findUseFrameAllocationViolations,
} from '../no-alloc-in-use-frame';

describe('FR-PERF-006 no-alloc-in-use-frame rule', () => {
  test('flags every configured Three.js allocation class inside useFrame', () => {
    for (const className of ALLOC_CLASSES) {
      const violations = findUseFrameAllocationViolations(`
        import { useFrame } from '@react-three/fiber';
        import { ${className} } from 'three';

        function MeshThing() {
          useFrame(() => {
            const value = new ${className}();
            void value;
          });
        }
      `);

      expect(violations).toEqual([
        expect.objectContaining({
          kind: 'alloc-in-use-frame',
          className,
          message: expect.stringContaining('GC pressure'),
        }),
      ]);
    }
  });

  test('allows module constants and useMemo-backed render allocations', () => {
    const violations = findUseFrameAllocationViolations(`
      import { useMemo } from 'react';
      import { useFrame } from '@react-three/fiber';
      import { Quaternion, Vector3 } from 'three';

      const TARGET = new Vector3(1, 0, 0);

      function MeshThing() {
        const rotation = useMemo(() => new Quaternion(), []);
        useFrame(() => {
          rotation.identity();
          camera.position.copy(TARGET);
        });
      }
    `);

    expect(violations).toEqual([]);
  });

  test('flags render allocations that are used inside useFrame without useMemo', () => {
    const violations = findUseFrameAllocationViolations(`
      import { useFrame } from '@react-three/fiber';
      import { Vector3 } from 'three';

      function MeshThing() {
        const target = new Vector3(0, 0, 1);
        useFrame(() => {
          camera.position.copy(target);
        });
      }
    `);

    expect(violations).toEqual([
      expect.objectContaining({
        kind: 'missing-use-memo',
        className: 'Vector3',
        fix: 'useMemo(() => new Vector3(0, 0, 1), [])',
      }),
    ]);
  });

  test('ignores tests and storybook files', () => {
    const source = `useFrame(() => { const value = new Vector3(); });`;

    expect(findUseFrameAllocationViolations(source, '/tmp/component.test.tsx')).toEqual([]);
    expect(findUseFrameAllocationViolations(source, '/tmp/component.stories.tsx')).toEqual([]);
    expect(findUseFrameAllocationViolations(source, '/tmp/__tests__/component.tsx')).toEqual([]);
  });

  test('builds the autofix replacement shape', () => {
    expect(buildUseMemoReplacement('new Vector3(1, 2, 3)')).toBe(
      'useMemo(() => new Vector3(1, 2, 3), [])',
    );
  });
});
