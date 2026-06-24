"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getScrollProgress } from "@/lib/scroll/progress";
import { resolveSceneState } from "@/lib/scene/progressMap";

// Commissioned GLB Lumi (FR-CHAR-022). Mounted only when NEXT_PUBLIC_LUMI_GLB is
// set (see GenieScene), so the procedural placeholder stays the default until a
// real model is dropped in. The model is cloned so per-frame transforms and
// unmount disposal never mutate drei's shared cache (FR-SCENE-009). It reuses
// the same scroll choreography as the placeholder: turn + drift from the scene
// map, with a light pointer-gaze.
//
// Tuning: a Meshy/Blender export rarely lands at the right size or origin for
// this hero framing. Adjust BASE_SCALE / BASE_POSITION below (or re-export the
// model centred at the origin, ~2 units tall) once you can see it on the page.
const BASE_SCALE = 1;
const BASE_POSITION: [number, number, number] = [1.3, -0.4, 0];

export function GltfLumi({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const prog = useRef(0);
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);

  // Dispose the cloned model's GPU resources on unmount (FR-SCENE-009).
  useEffect(() => {
    return () => {
      model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose?.();
      });
    };
  }, [model]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const s = resolveSceneState(prog.current);
    g.rotation.y = s.model.spin + state.pointer.x * 0.2;
    g.position.x = BASE_POSITION[0] + s.model.driftX;
    g.position.z = BASE_POSITION[2] + s.model.driftZ;
  });

  return (
    <group ref={group} position={BASE_POSITION} scale={BASE_SCALE}>
      <primitive object={model} />
    </group>
  );
}
