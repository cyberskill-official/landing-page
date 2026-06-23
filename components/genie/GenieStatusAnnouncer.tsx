"use client";

import { useGenieStore } from "@/lib/genie/store";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// DOM-text mirror of the canvas (FR-A11Y-005). Lumi and the 3D scene are
// decorative (the canvas layer is aria-hidden), but Lumi's communicative
// states - thinking while a request is in flight, responding while tokens
// stream - are mirrored here as polite screen-reader announcements so a
// non-visual user gets the same cue the animation gives a sighted one. Idle and
// listening announce nothing (they carry no new information). The chat log
// already announces the message text itself; this conveys the avatar's state.
export function GenieStatusAnnouncer({ dict }: { dict: Dictionary }) {
  const status = useGenieStore((s) => s.status);
  const text =
    status === "thinking"
      ? dict.a11y.lumiThinking
      : status === "speaking"
        ? dict.a11y.lumiResponding
        : "";
  return (
    <p className="cs-visually-hidden" role="status" aria-live="polite">
      {text}
    </p>
  );
}
