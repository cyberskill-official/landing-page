import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Icon } from "@/components/ui/Icon";

// Kinetic keyword band (FR-DS-012): the practice keywords glide past between
// the value props and the services grid. Purely decorative - the whole band is
// aria-hidden because the Services section right below carries the same offer
// as real, accessible content. The loop is CSS-only (translate3d on a
// max-content track, two identical halves for a seamless -50% wrap), pauses on
// hover, and freezes under prefers-reduced-motion.
export function Marquee({ dict }: { dict: Dictionary }) {
  const items = dict.marquee.items;
  return (
    <div className="cs-marquee cs-no-print" aria-hidden="true">
      <div className="cs-marquee-track">
        {[0, 1].map((half) => (
          <div className="cs-marquee-half" key={half}>
            {items.map((item, i) => (
              <span className="cs-marquee-item" key={i}>
                {item}
                <Icon name="sparkle" size="sm" className="cs-marquee-star" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
