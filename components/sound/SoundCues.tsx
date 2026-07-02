"use client";

import { useEffect } from "react";
import { play } from "@/lib/sound/engine";
import { GENIE_OPEN_EVENT } from "@/components/genie/GenieOpenButton";
import { WISH_GRANTED_EVENT, LUMI_GREET_EVENT } from "@/lib/scene/mascot";

// Plays sound cues for the site's magical moments. Mounted once in the locale
// layout. play() is a no-op unless the visitor has turned sound on, so this is
// completely inert by default - it just wires the existing DOM events to cues.
export function SoundCues() {
  useEffect(() => {
    const onOpen = () => play("open");
    const onGrant = () => play("grant");
    const onGreet = () => play("greet");
    window.addEventListener(GENIE_OPEN_EVENT, onOpen);
    window.addEventListener(WISH_GRANTED_EVENT, onGrant);
    window.addEventListener(LUMI_GREET_EVENT, onGreet);
    return () => {
      window.removeEventListener(GENIE_OPEN_EVENT, onOpen);
      window.removeEventListener(WISH_GRANTED_EVENT, onGrant);
      window.removeEventListener(LUMI_GREET_EVENT, onGreet);
    };
  }, []);
  return null;
}
