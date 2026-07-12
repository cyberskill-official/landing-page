"use client";

import { useEffect } from "react";
import { play } from "@/lib/sound/engine";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { WISH_GRANTED_EVENT, LUMI_GREET_EVENT, requestBurst } from "@/lib/scene/mascot";

// Plays sound cues for the site's magical moments. Mounted once in the locale
// layout. play() is a no-op unless the visitor has turned sound on, so this is
// completely inert by default - it just wires the existing DOM events to cues.
export function SoundCues() {
  useEffect(() => {
    const onOpen = () => play("open");
    const onGrant = () => play("grant");
    const onGreet = () => play("greet");
    
    // Optional subtle sound on hover
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button']")) {
        play("hover");
      }
    };

    // Keyboard easter egg: type "lumi" to trigger a magical burst
    let typed = "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typed += e.key.toLowerCase();
        if (typed.length > 4) typed = typed.slice(-4);
        if (typed === "lumi") {
          play("easterEgg");
          requestBurst(2.0); // massive burst
          typed = "";
        }
      }
    };

    window.addEventListener(GENIE_OPEN_EVENT, onOpen);
    window.addEventListener(WISH_GRANTED_EVENT, onGrant);
    window.addEventListener(LUMI_GREET_EVENT, onGreet);
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: true });
    
    return () => {
      window.removeEventListener(GENIE_OPEN_EVENT, onOpen);
      window.removeEventListener(WISH_GRANTED_EVENT, onGrant);
      window.removeEventListener(LUMI_GREET_EVENT, onGreet);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
