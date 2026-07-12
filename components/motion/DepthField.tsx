import type { CSSProperties } from "react";
import { useMotionStore } from "@/lib/a11y/motion-store";

// Site-wide parallax depth field (FR-DS-014): a faint layer of gold embers that
// drift at several scroll rates, so the page reads with real z-depth instead of
// one flat plane. Pure SSR markup - CSS does all the motion off the --cs-scroll
// and --cs-scroll-v variables MotionExtras publishes, so this ships zero client
// JS. Decorative (aria-hidden, pointer-events:none, screen-blended, very low
// opacity) and fully hidden under prefers-reduced-motion.
//
// Positions are a fixed, deterministic table (never Math.random) so the server
// and client markup match exactly - no hydration drift. `--r` is the parallax
// rate tier (further-back embers move less); `--s` scales size and base glow.
const EMBERS: ReadonlyArray<{ x: number; y: number; r: number; s: number }> = [
  { x: 8, y: 12, r: 0.5, s: 0.7 },
  { x: 22, y: 74, r: 1.4, s: 1.1 },
  { x: 34, y: 30, r: 0.9, s: 0.5 },
  { x: 47, y: 88, r: 1.9, s: 1.3 },
  { x: 58, y: 18, r: 0.6, s: 0.6 },
  { x: 69, y: 62, r: 1.2, s: 0.9 },
  { x: 78, y: 8, r: 1.7, s: 1.2 },
  { x: 88, y: 44, r: 0.7, s: 0.5 },
  { x: 15, y: 52, r: 1.5, s: 1.0 },
  { x: 40, y: 66, r: 0.8, s: 0.6 },
  { x: 63, y: 36, r: 1.8, s: 1.15 },
  { x: 83, y: 78, r: 1.0, s: 0.8 },
  { x: 27, y: 24, r: 1.3, s: 0.9 },
  { x: 52, y: 48, r: 0.6, s: 0.5 },
  { x: 73, y: 92, r: 1.6, s: 1.05 },
  { x: 93, y: 22, r: 1.1, s: 0.75 },
];

export function DepthField() {
  const reduce = useMotionStore((s) => s.reduce);
  
  if (reduce) return null;

  return (
    <div className="cs-depth" aria-hidden="true">
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="cs-depth-ember"
          style={
            {
              "--x": `${e.x}%`,
              "--y": `${e.y}%`,
              "--r": e.r,
              "--s": e.s,
              "--d": `${(i % 5) * 0.7}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
