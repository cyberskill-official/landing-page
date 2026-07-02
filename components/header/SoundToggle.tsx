"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { isSoundOn, setSoundOn, SOUND_CHANGED_EVENT } from "@/lib/sound/engine";

// Opt-in sound toggle (FR-CHAR-034). Sound is OFF until the visitor turns it on
// (browsers block autoplay and silence is the polite default); the choice
// persists. Mirrors ThemeToggle - a bordered icon button in the header actions,
// with aria-pressed announcing the on/off state.
export function SoundToggle({ on: onLabel, off: offLabel }: { on: string; off: string }) {
  const [mounted, setMounted] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSound(isSoundOn());
    const sync = () => setSound(isSoundOn());
    window.addEventListener(SOUND_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SOUND_CHANGED_EVENT, sync);
  }, []);

  // Render nothing until mounted: the server cannot know the stored preference,
  // so deferring avoids a hydration mismatch (same approach as ThemeToggle).
  if (!mounted) return null;

  // The label states the action the button will perform.
  const label = sound ? offLabel : onLabel;
  return (
    <button
      type="button"
      className="cs-theme-toggle cs-sound-toggle"
      aria-label={label}
      aria-pressed={sound}
      title={label}
      onClick={() => setSoundOn(!sound)}
    >
      <Icon name={sound ? "sound-on" : "sound-off"} size="sm" />
    </button>
  );
}
