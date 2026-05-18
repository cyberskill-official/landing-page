# no-alloc-in-use-frame

`useFrame` runs on the render loop. Three.js value allocations inside that callback create steady garbage collection pressure and can show up as INP regressions on mobile devices.

The rule reports:

- `new Vector2/3/4`, `Quaternion`, `Matrix3/4`, `Color`, `Euler`, `Box3`, and `Sphere` inside `useFrame`.
- Three.js value objects created during component render and then read inside `useFrame` without `useMemo`.

Valid patterns:

```tsx
const TARGET = new Vector3(0, 0, 1);

function SceneMesh() {
  const reusable = useMemo(() => new Quaternion(), []);
  useFrame(() => {
    reusable.identity();
    camera.position.lerp(TARGET, 0.1);
  });
}
```

Invalid pattern:

```tsx
function SceneMesh() {
  useFrame(() => {
    camera.position.copy(new Vector3(0, 0, 1));
  });
}
```

Test and Storybook files are ignored.
