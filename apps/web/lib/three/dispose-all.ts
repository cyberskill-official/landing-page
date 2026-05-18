import type {
  BufferGeometry,
  Material,
  Object3D,
  Texture,
  WebGLRenderTarget,
} from 'three';

type Disposable = {
  dispose: () => void;
  userData?: Record<string, unknown>;
};

export type DisposeTarget =
  | Object3D
  | BufferGeometry
  | Material
  | Texture
  | WebGLRenderTarget
  | Disposable;

export type DisposeAllOptions = {
  includeCached?: boolean;
};

const disposed = new WeakSet<object>();
const cachedResourceFlags = new Set([
  'skipDispose',
  'dreiCached',
  'dreiManaged',
  'managedByDrei',
  'preserveOnUnmount',
]);

export function disposeAll(target: DisposeTarget | null | undefined, options: DisposeAllOptions = {}): void {
  if (!target) return;

  if (isObject3D(target)) {
    disposeObjectTree(target, options);
    return;
  }

  if (isMaterial(target)) {
    disposeMaterial(target, options);
    return;
  }

  disposeOnce(target as Disposable, options);
}

export function disposeMaterial(material: Material | null | undefined, options: DisposeAllOptions = {}): void {
  if (!material || shouldSkipDispose(material, options)) return;

  const materialRecord = material as Material & Record<string, unknown>;
  for (const value of Object.values(materialRecord)) {
    disposeTextureValue(value, options);
  }

  disposeOnce(material as Disposable, options);
}

export function hasBeenDisposed(target: object): boolean {
  return disposed.has(target);
}

function disposeObjectTree(root: Object3D, options: DisposeAllOptions) {
  const stack: Object3D[] = [root];

  while (stack.length > 0) {
    const object = stack.pop();
    if (!object || shouldSkipDispose(object, options)) continue;

    for (let index = object.children.length - 1; index >= 0; index -= 1) {
      const child = object.children[index];
      if (child) stack.push(child);
    }

    const maybeRenderable = object as Object3D & {
      geometry?: BufferGeometry;
      material?: Material | Material[];
      renderTarget?: WebGLRenderTarget;
    };

    disposeOnce(maybeRenderable.geometry, options);
    disposeOnce(maybeRenderable.renderTarget, options);

    const materials = Array.isArray(maybeRenderable.material)
      ? maybeRenderable.material
      : [maybeRenderable.material];
    for (const material of materials) disposeMaterial(material, options);
  }
}

function disposeTextureValue(value: unknown, options: DisposeAllOptions) {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const item of value) disposeTextureValue(item, options);
    return;
  }

  if (isTexture(value)) disposeOnce(value, options);
}

function disposeOnce(target: Disposable | null | undefined, options: DisposeAllOptions) {
  if (!target || shouldSkipDispose(target, options) || disposed.has(target)) return;
  disposed.add(target);
  target.dispose();
}

function shouldSkipDispose(target: { userData?: Record<string, unknown> }, options: DisposeAllOptions) {
  if (options.includeCached) return false;
  const userData = target.userData;
  if (!userData) return false;

  for (const flag of cachedResourceFlags) {
    if (userData[flag]) return true;
  }

  return userData.disposeOnUnmount === false || userData.resourceOwner === 'drei';
}

function isObject3D(value: unknown): value is Object3D {
  return Boolean(value && typeof value === 'object' && 'isObject3D' in value);
}

function isMaterial(value: unknown): value is Material {
  return Boolean(value && typeof value === 'object' && 'isMaterial' in value);
}

function isTexture(value: unknown): value is Texture {
  return Boolean(value && typeof value === 'object' && 'isTexture' in value);
}
