"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { getScrollProgress } from "@/lib/scroll/progress";
import { getPointerNorm, requestBurst } from "@/lib/scene/mascot";
import { resolveSceneState } from "@/lib/scene/progressMap";

// Commissioned GLB Lumi (FR-CHAR-022). Mounted only when NEXT_PUBLIC_LUMI_GLB is
// set (see GenieScene), so the procedural placeholder stays the default until a
// real model is dropped in. The model is skeleton-cloned (see below) so per-frame
// transforms never mutate drei's shared cache (FR-SCENE-009), and it plays the
// baked Idle clip. It reuses the same scroll choreography as the placeholder:
// turn + drift from the scene map, with a light pointer-gaze.
//
// Tuning: a Meshy/Blender export rarely lands at the right size or origin for
// this hero framing. Adjust BASE_SCALE / BASE_POSITION below (or re-export the
// model centred at the origin, ~2 units tall) once you can see it on the page.
// Placement across the page belongs to the mascot rig (FR-CHAR-030); these
// offsets are LOCAL (model centring), not page position.
const BASE_SCALE = 1;
const BASE_POSITION: [number, number, number] = [0, -0.4, 0];
// Name of the baked idle clip in the GLB (see lumi-3d export). Falls back to the
// first available clip if the name ever changes.
const IDLE_CLIP = "Idle";
// Baked one-shot welcome clip (arms-open wave). Played once when the contact
// section scrolls into view, then Lumi settles back into Idle. Optional: if the
// export has no such clip the greet wiring simply no-ops.
const GREET_CLIP = "Greet";

export function GltfLumi({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const prog = useRef(0);
  const greeting = useRef(false);
  const { scene, animations } = useGLTF(url);
  // A skinned mesh must be cloned with SkeletonUtils.clone: THREE.Object3D.clone()
  // leaves the copy bound to the source skeleton, so the baked animation would not
  // deform this instance. SkeletonUtils shares geometry/materials with drei's
  // cached original, so we do NOT dispose them here (that would corrupt the cache
  // on remount); drei owns the cached source's lifecycle (FR-SCENE-009).
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    // Premium material polish: clone the shared materials (so drei's cache stays
    // clean) and drink in more of the IBL so the gold reads rich and reflective
    // rather than flat. envMapIntensity pairs with the studio Environment/bloom.
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const polish = (m: THREE.Material) => {
        const std = m.clone() as THREE.MeshStandardMaterial;
        if ("envMapIntensity" in std) std.envMapIntensity = 1.5;
        return std;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(polish)
        : polish(mesh.material);
    });
    return clone;
  }, [scene]);
  const { actions, mixer } = useAnimations(animations, model);

  // Play the baked idle loop (float + tail sway + hair). useAnimations advances
  // its mixer on the r3f frame loop, so no manual tick is needed; the procedural
  // spin/drift below still layers on top for the scroll choreography.
  useEffect(() => {
    const clip = actions[IDLE_CLIP] ?? Object.values(actions)[0];
    if (!clip) return;
    clip.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      clip.fadeOut(0.25);
    };
  }, [actions]);

  // Greet when the contact section arrives (FR-CHAR-030 welcome beat): crossfade
  // Idle -> Greet, play it once, then crossfade back to Idle on finish. Guarded
  // so overlapping intersections never stack, and a burst of pixie dust punctuates
  // the wave. No-ops safely if the export lacks a distinct greet clip.
  useEffect(() => {
    const idle = actions[IDLE_CLIP] ?? Object.values(actions)[0];
    const greet =
      actions[GREET_CLIP] ?? Object.values(actions).find((a) => a && a !== idle) ?? null;
    if (!idle || !greet || greet === idle) return;
    const target = document.getElementById("contact");
    if (!target || typeof IntersectionObserver === "undefined") return;

    const playGreet = () => {
      if (greeting.current) return;
      greeting.current = true;
      idle.fadeOut(0.3);
      greet.reset().setLoop(THREE.LoopOnce, 1);
      greet.clampWhenFinished = true;
      greet.fadeIn(0.3).play();
      requestBurst(1.2);
    };
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== greet) return;
      greeting.current = false;
      greet.fadeOut(0.4);
      idle.reset().fadeIn(0.4).play();
    };
    mixer.addEventListener("finished", onFinished);

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) playGreet();
      },
      { threshold: 0.4 },
    );
    io.observe(target);
    return () => {
      io.disconnect();
      mixer.removeEventListener("finished", onFinished);
    };
  }, [actions, mixer]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const s = resolveSceneState(prog.current);
    // Window-fed pointer store: the canvas is pointer-inert, so r3f's own
    // state.pointer never updates (see lib/scene/mascot.ts).
    g.rotation.y = s.model.spin + getPointerNorm().x * 0.2;
    g.position.x = BASE_POSITION[0] + s.model.driftX * 0.35;
    g.position.z = BASE_POSITION[2] + s.model.driftZ * 0.5;
  });

  return (
    <group ref={group} position={BASE_POSITION} scale={BASE_SCALE}>
      <primitive object={model} />
    </group>
  );
}
