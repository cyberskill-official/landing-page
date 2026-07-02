import type { CSSProperties } from "react";
import { splitSloganWords } from "@/lib/motion/kinetic";

// Per-word masked text for section headings (FR-DS-013 v2): the words rise in
// with a stagger when the carrying heading's [data-mask-reveal] flips to
// "shown". Same accessibility contract as the hero H1 - the heading carries
// the full string on aria-label, these spans are aria-hidden visuals, and the
// words are real SSR text (crawlers see them; the reduced-motion and
// scripting:none guards force them visible).
export function KineticText({ text }: { text: string }) {
  return (
    <>
      {splitSloganWords(text).map((word, i) => (
        <span className="cs-kt-word" aria-hidden="true" key={`${word}-${i}`}>
          <span className="cs-kt-inner" style={{ "--kti": i } as CSSProperties}>
            {word}
          </span>
        </span>
      ))}
    </>
  );
}
