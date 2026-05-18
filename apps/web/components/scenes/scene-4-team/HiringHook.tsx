import React from 'react';

export function HiringHook({ count = 5 }: { count?: number }) {
  return (
    <a className="scene-4-team__hiring" href="/work?action=join#join" data-scene-4-hiring>
      We're hiring {count}
    </a>
  );
}
