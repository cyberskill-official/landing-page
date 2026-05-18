'use client';

import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { useActiveScene } from '@/lib/stores';

export type SceneShadowMirrorDefinition = {
  altDescription: string;
  narration: Record<SupportedLocale, string>;
  sceneId: number;
  slug: string;
  title: Record<SupportedLocale, string>;
};

export type SceneShadowMirrorProps = {
  altDescription: string;
  lang?: SupportedLocale;
  narration: string;
  sceneId: number;
  title: string;
  totalScenes?: number;
  visible?: boolean;
};

export const SCENE_SHADOW_MIRRORS: SceneShadowMirrorDefinition[] = [
  {
    altDescription: 'Illustration of Lumi hovering over a sunset-lit Saigon rooftop with antenna silhouettes.',
    narration: {
      en: "Whisper an idea. I'll show you the rest.",
      vi: 'Noi mot y tuong. Toi se cho ban thay phan con lai.',
    },
    sceneId: 0,
    slug: 'scene-0',
    title: {
      en: 'What if your will became real?',
      vi: 'Neu y chi cua ban thanh hien thuc?',
    },
  },
  {
    altDescription: 'Warm sepia interior with a small golden idea-spark wrapped by Lumi light.',
    narration: {
      en: "Stephen had one rule: build what you'd be proud to sign.",
      vi: 'Stephen chi co mot nguyen tac: xay dieu minh du tu hao de ky ten.',
    },
    sceneId: 1,
    slug: 'scene-1',
    title: {
      en: 'Saigon, 2020.',
      vi: 'Sai Gon, 2020.',
    },
  },
  {
    altDescription: 'A sketch turns into a working product interface through a ribbon of light.',
    narration: {
      en: 'Most software dies in the gap between sketch and ship. We close it.',
      vi: 'Phan mem thuong chet giua ban phac thao va ngay ra mat. Chung toi khep khoang cach do.',
    },
    sceneId: 2,
    slug: 'scene-2',
    title: {
      en: 'From sketch to system.',
      vi: 'Tu phac thao den he thong.',
    },
  },
  {
    altDescription: 'Four capability pillars orbit the scene like practical tools rather than decoration.',
    narration: {
      en: 'React, Three.js, AI, design systems - four hands of the same craft.',
      vi: 'React, Three.js, AI, design system - bon ban tay cua cung mot nghe.',
    },
    sceneId: 3,
    slug: 'scene-3',
    title: {
      en: 'How we turn will into real.',
      vi: 'Cach chung toi bien y chi thanh hien thuc.',
    },
  },
  {
    altDescription: 'Ten senior makers appear as a quiet constellation around the work.',
    narration: {
      en: 'Ten of us. All senior. All Vietnamese. All remote.',
      vi: 'Muoi nguoi. Deu senior. Deu o Viet Nam. Deu lam viec tu xa.',
    },
    sceneId: 4,
    slug: 'scene-4',
    title: {
      en: 'Ten people. One craft.',
      vi: 'Muoi nguoi. Mot nghe.',
    },
  },
  {
    altDescription: 'A warm arc connects Saigon to client time zones across the globe.',
    narration: {
      en: 'From Saigon to your time zone.',
      vi: 'Tu Sai Gon den mui gio cua ban.',
    },
    sceneId: 5,
    slug: 'scene-5',
    title: {
      en: 'From Saigon to your time zone.',
      vi: 'Tu Sai Gon den mui gio cua ban.',
    },
  },
  {
    altDescription: 'Three practical paths invite the visitor to buy, partner, or join.',
    narration: {
      en: 'You bring the will. We bring the real.',
      vi: 'Ban mang y chi. Chung toi mang hien thuc.',
    },
    sceneId: 6,
    slug: 'scene-6',
    title: {
      en: 'What do you want to make real?',
      vi: 'Ban muon bien dieu gi thanh hien thuc?',
    },
  },
  {
    altDescription: 'Lumi waves goodbye near the footer trust signals and secondary navigation.',
    narration: {
      en: 'Until your next wish.',
      vi: 'Hen uoc nguyen tiep theo cua ban.',
    },
    sceneId: 7,
    slug: 'footer',
    title: {
      en: 'Trust signals and secondary navigation',
      vi: 'Tin hieu tin cay va dieu huong phu',
    },
  },
];

const ANNOUNCE_DEBOUNCE_MS = 500;

export function formatSceneAnnouncement(sceneId: number, totalScenes: number, narration: string) {
  return `Scene ${sceneId + 1} of ${totalScenes}: ${narration}`;
}

export function SceneShadowMirror({
  altDescription,
  lang = 'en',
  narration,
  sceneId,
  title,
  totalScenes = SCENE_SHADOW_MIRRORS.length,
  visible = false,
}: SceneShadowMirrorProps) {
  const activeScene = useActiveScene();
  const isActive = activeScene === sceneId;
  const [displayedNarration, setDisplayedNarration] = useState(narration);
  const headingId = `scene-${sceneId}-shadow-heading`;
  const narrationId = `scene-${sceneId}-shadow-narration`;
  const fallbackId = `scene-${sceneId}-shadow-alt`;

  useEffect(() => {
    const timer = window.setTimeout(() => setDisplayedNarration(narration), ANNOUNCE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [narration]);

  return (
    <section
      role="img"
      aria-labelledby={headingId}
      aria-describedby={`${narrationId} ${fallbackId}`}
      className={visible ? 'scene-shadow-mirror scene-shadow-mirror--visible' : 'scene-shadow-mirror visually-hidden'}
      data-scene-shadow-mirror={sceneId}
      tabIndex={0}
      lang={lang}
    >
      <h2 id={headingId}>{title}</h2>
      <p id={narrationId} aria-live={isActive ? 'polite' : 'off'} aria-atomic="true">
        {formatSceneAnnouncement(sceneId, totalScenes, displayedNarration)}
      </p>
      <p id={fallbackId}>{altDescription}</p>
    </section>
  );
}

export function SceneShadowMirrorSet({
  locale,
  visible = false,
}: {
  locale: SupportedLocale;
  visible?: boolean;
}) {
  const mirrors = useMemo(
    () =>
      SCENE_SHADOW_MIRRORS.map((scene) => (
        <SceneShadowMirror
          key={scene.slug}
          altDescription={scene.altDescription}
          lang={locale}
          narration={scene.narration[locale]}
          sceneId={scene.sceneId}
          title={scene.title[locale]}
          visible={visible}
        />
      )),
    [locale, visible],
  );

  return (
    <>
      <CanvasAriaHider />
      {mirrors}
    </>
  );
}

function CanvasAriaHider() {
  useEffect(() => {
    const markCanvases = () => {
      for (const canvas of document.querySelectorAll('canvas')) {
        canvas.setAttribute('aria-hidden', 'true');
      }
    };

    markCanvases();
    const observer = new MutationObserver(markCanvases);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
