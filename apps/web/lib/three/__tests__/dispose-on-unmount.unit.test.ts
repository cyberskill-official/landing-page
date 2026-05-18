import { describe, expect, test, vi } from 'vitest';
import {
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  WebGLRenderTarget,
} from 'three';
import { disposeAll } from '../dispose-all';
import { disposeRefTargets } from '../use-dispose-on-unmount';

describe('FR-PERF-005 disposeAll and useDisposeOnUnmount cleanup', () => {
  test('recursively disposes geometry, material, textures, and render targets once', () => {
    const root = new Object3D();
    const geometry = new BufferGeometry();
    const texture = new Texture();
    const normal = new Texture();
    const material = new MeshStandardMaterial({ map: texture, normalMap: normal });
    const mesh = new Mesh(geometry, material);
    const renderTarget = new WebGLRenderTarget(8, 8);
    Object.assign(mesh, { renderTarget });
    root.add(mesh);

    const disposeSpies = [geometry, texture, normal, material, renderTarget].map((target) =>
      vi.spyOn(target, 'dispose'),
    );

    disposeAll(root);
    disposeAll(root);

    for (const spy of disposeSpies) expect(spy).toHaveBeenCalledTimes(1);
  });

  test('handles material arrays and direct disposable refs', () => {
    const first = new MeshBasicMaterial();
    const second = new MeshBasicMaterial();
    const geometry = new BufferGeometry();
    const mesh = new Mesh(geometry, [first, second]);
    const root = new Object3D();
    root.add(mesh);

    const firstDispose = vi.spyOn(first, 'dispose');
    const secondDispose = vi.spyOn(second, 'dispose');
    const geometryDispose = vi.spyOn(geometry, 'dispose');

    disposeAll(root);

    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
    expect(geometryDispose).toHaveBeenCalledTimes(1);
  });

  test('does not dispose resources marked as Drei-managed cache entries', () => {
    const root = new Object3D();
    const geometry = new BufferGeometry();
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    mesh.userData.dreiManaged = true;
    root.add(mesh);

    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');

    disposeAll(root);

    expect(geometryDispose).not.toHaveBeenCalled();
    expect(materialDispose).not.toHaveBeenCalled();
  });

  test('disposeRefTargets supports null refs, arrays, and 100 unmount cycles without growth', () => {
    const disposeCalls: ReturnType<typeof vi.fn>[] = [];
    const start = disposeCalls.length;

    for (let index = 0; index < 100; index += 1) {
      const first = { dispose: vi.fn() };
      const second = { dispose: vi.fn() };
      disposeCalls.push(first.dispose, second.dispose);

      disposeRefTargets([
        { current: null },
        { current: [first, second] },
      ]);
      disposeRefTargets([{ current: [first, second] }]);
    }

    expect(disposeCalls.length - start).toBe(200);
    for (const dispose of disposeCalls) expect(dispose).toHaveBeenCalledTimes(1);
  });
});
