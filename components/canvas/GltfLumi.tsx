"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import { getScrollProgress } from "@/lib/scroll/progress";
import {
  getPointerNorm,
  requestBurst,
  drainGestures,
  getLumiExcite,
  getDigest,
  setLumiHand,
  setLumiHandScreen,
  LUMI_GREET_EVENT,
  WISH_GRANTED_EVENT,
} from "@/lib/scene/mascot";
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
// Baked clips in the GLB (lumi-3d export). Idle is the looping base; Wave (raise
// hand + wave) and Cast (arms-wide magic) are one-shot gestures Lumi plays as
// she arrives at each act, on hover, and when a wish is granted, then settles
// back into Idle. Missing clips no-op safely.
const IDLE_CLIP = "Idle";
const WAVE_CLIP = "Wave";
const CAST_CLIP = "Cast";
// The offering pose (arm stretched forward, palm out) Lumi holds while she
// digests the page, so the black hole sits in her outstretched hand instead of
// at her side. Clamped on its last frame (the fully-extended reach), so it
// stays held for as long as the digest runs, then crossfades back to idle.
const HOLD_CLIP = "Hold";

export function GltfLumi({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const prog = useRef(0);
  const greeting = useRef(false);
  const playGestureRef = useRef<((name: string) => void) | null>(null);
  const excitePrev = useRef(false);
  const digestHold = useRef(false);
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
  const camera = useThree((s) => s.camera);
  const canvasSize = useThree((s) => s.size);
  const tmpV = useMemo(() => new THREE.Vector3(), []);
  // Both hand bones. The digest pose lifts ONE arm overhead, and the hole rides
  // that raised hand - so each frame we pick whichever hand is currently higher
  // rather than trusting an R/L name (that was locking the hole to the lowered
  // hand). glTF may sanitise "hand.R" to "hand_R"/"handR", so match loosely.
  const handBones = useMemo(() => {
    const hands: THREE.Object3D[] = [];
    model.traverse((o) => {
      if ((o as THREE.Bone).isBone && o.name.toLowerCase().includes("hand")) hands.push(o);
    });
    return hands;
  }, [model]);

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

  // Gesture player (FR-CHAR-034): crossfade Idle -> a one-shot clip -> Idle.
  // Driven by the scene - SceneFocus queues Wave/Cast on each act arrival, a
  // granted wish casts, and hovering Lumi waves - so she performs instead of
  // gliding in Idle (the "ragdoll" fix). Guarded so overlapping requests never
  // stack; a pixie-dust burst and the greet chime punctuate each gesture.
  // Missing clips no-op safely.
  useEffect(() => {
    const idle = actions[IDLE_CLIP] ?? Object.values(actions)[0];
    if (!idle) return;

    const playGesture = (name: string) => {
      if (greeting.current) return;
      const clip = actions[name];
      if (!clip || clip === idle) return;
      greeting.current = true;
      idle.fadeOut(0.25);
      clip.reset().setLoop(THREE.LoopOnce, 1);
      clip.clampWhenFinished = true;
      clip.fadeIn(0.25).play();
      try {
        requestBurst(name === CAST_CLIP ? 1.6 : 1.0);
      } catch {
        // scene absent: capped no-op
      }
      window.dispatchEvent(new CustomEvent(LUMI_GREET_EVENT));
    };
    playGestureRef.current = playGesture;

    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (!greeting.current || e.action === idle) return;
      greeting.current = false;
      e.action.fadeOut(0.35);
      idle.reset().fadeIn(0.35).play();
    };
    mixer.addEventListener("finished", onFinished);

    // A granted wish is the big magic beat: Lumi casts.
    const onWish = () => playGesture(CAST_CLIP);
    window.addEventListener(WISH_GRANTED_EVENT, onWish);

    return () => {
      mixer.removeEventListener("finished", onFinished);
      window.removeEventListener(WISH_GRANTED_EVENT, onWish);
      playGestureRef.current = null;
    };
  }, [actions, mixer]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // Digest pose: while the page is being devoured, Lumi holds the offering
    // clip (arm outstretched) so the black hole sits in her extended hand, and
    // she ignores section gestures. Crossfade in on the first digest frame,
    // then back to idle once it has fully reversed. HOLD is LoopOnce+clamped, so
    // it settles on the fully-reached pose and stays there for the whole hold;
    // its later "finished" event is ignored because greeting.current is false.
    const holdWanted = getDigest() > 0.02;
    if (holdWanted !== digestHold.current) {
      digestHold.current = holdWanted;
      const idle = actions[IDLE_CLIP] ?? Object.values(actions)[0];
      const hold = actions[HOLD_CLIP];
      if (hold && idle && hold !== idle) {
        greeting.current = false;
        if (holdWanted) {
          for (const a of Object.values(actions)) if (a && a !== hold) a.fadeOut(0.3);
          hold.reset().setLoop(THREE.LoopOnce, 1);
          hold.clampWhenFinished = true;
          hold.fadeIn(0.3).play();
        } else {
          hold.fadeOut(0.45);
          idle.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.45).play();
        }
      }
    }

    // Perform the queued gestures (act arrivals, from SceneFocus) and wave on
    // the rising edge of a hover, so Lumi keeps reacting through the scroll -
    // unless she is holding the digest pose, which owns her arms.
    const play = playGestureRef.current;
    if (play && !digestHold.current) {
      for (const name of drainGestures()) play(name);
      const ex = getLumiExcite();
      if (ex && !excitePrev.current) play(WAVE_CLIP);
      excitePrev.current = ex;
    }
    prog.current += (getScrollProgress() - prog.current) * Math.min(1, delta * 2.5);
    const s = resolveSceneState(prog.current);
    // Window-fed pointer store: the canvas is pointer-inert, so r3f's own
    // state.pointer never updates (see lib/scene/mascot.ts).
    // Face the viewer while presenting the digest hole; otherwise follow the
    // scroll spin + a light pointer glance.
    if (digestHold.current) {
      g.rotation.y += (0 - g.rotation.y) * Math.min(1, delta * 3);
    } else {
      g.rotation.y = s.model.spin + getPointerNorm().x * 0.2;
    }
    g.position.x = BASE_POSITION[0] + s.model.driftX * 0.35;
    g.position.z = BASE_POSITION[2] + s.model.driftZ * 0.5;

    // Publish the real hand position (world + projected to screen) so the black
    // hole sits exactly in her hand and the page-suck target aims at the same
    // point. Force the skeleton pose and the rig matrices current THIS frame
    // before reading: the mixer pose and the face-front rotation set just above
    // both otherwise land after r3f's own matrix pass, so a plain read lags a
    // frame - and during the turn-to-face that one-frame swing threw the hole to
    // the opposite side. mixer.update(0) reapplies the current clip pose without
    // advancing time; updateWorldMatrix walks the chain so g.rotation.y counts.
    if (handBones.length) {
      mixer.update(0);
      // Ride the RAISED hand (highest world Y) - the overhead-point pose lifts
      // one arm, and that is the hand holding the hole.
      let hand = handBones[0];
      let bestY = -Infinity;
      for (const hb of handBones) {
        hb.updateWorldMatrix(true, false);
        hb.getWorldPosition(tmpV);
        if (tmpV.y > bestY) {
          bestY = tmpV.y;
          hand = hb;
        }
      }
      hand.getWorldPosition(tmpV);
      // The hole rides her FINGERTIP, not the middle of the hand: shift up ~one
      // bone-length along the hand's own axis (its world +Y basis, so it stays
      // right under the model's scale and her turn). In the overhead point the
      // finger aims up, so this lands the hole just past the tip.
      const e = hand.matrixWorld.elements;
      tmpV.x += e[4] * 0.17;
      tmpV.y += e[5] * 0.17;
      tmpV.z += e[6] * 0.17;
      setLumiHand({ x: tmpV.x, y: tmpV.y, z: tmpV.z });
      tmpV.project(camera);
      setLumiHandScreen({
        x: (tmpV.x * 0.5 + 0.5) * canvasSize.width,
        y: (-tmpV.y * 0.5 + 0.5) * canvasSize.height,
      });
    }
  });

  return (
    <group ref={group} position={BASE_POSITION} scale={BASE_SCALE}>
      <primitive object={model} />
    </group>
  );
}
