import { describe, expect, test, vi } from 'vitest';
import { AnimationMixer, BufferGeometry, Mesh, MeshStandardMaterial, Object3D, Texture } from 'three';
import { disposeMixer, disposeSubtree } from '../../lib/scene-disposal';

describe('FR-WEB-003 disposeSubtree', () => {
  test('disposes geometry, material, and material texture slots', () => {
    const root = new Object3D();
    const geometry = new BufferGeometry();
    const texture = new Texture();
    const normal = new Texture();
    const material = new MeshStandardMaterial({ map: texture, normalMap: normal });
    const mesh = new Mesh(geometry, material);
    root.add(mesh);

    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    const normalDispose = vi.spyOn(normal, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');

    disposeSubtree(root);

    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
    expect(normalDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
  });

  test('handles material arrays and is idempotent', () => {
    const root = new Object3D();
    const geometry = new BufferGeometry();
    const first = new MeshStandardMaterial();
    const second = new MeshStandardMaterial();
    const mesh = new Mesh(geometry, [first, second]);
    root.add(mesh);

    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const firstDispose = vi.spyOn(first, 'dispose');
    const secondDispose = vi.spyOn(second, 'dispose');

    disposeSubtree(root);
    disposeSubtree(root);

    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
  });

  test('is null-safe', () => {
    expect(() => disposeSubtree(null)).not.toThrow();
    expect(() => disposeSubtree(undefined)).not.toThrow();
  });

  test('cleans up animation mixers', () => {
    const root = new Object3D();
    const mixer = new AnimationMixer(root);
    const stopAllAction = vi.spyOn(mixer, 'stopAllAction');
    const uncacheRoot = vi.spyOn(mixer, 'uncacheRoot');

    disposeMixer(mixer, root);

    expect(stopAllAction).toHaveBeenCalledTimes(1);
    expect(uncacheRoot).toHaveBeenCalledWith(root);
  });
});
