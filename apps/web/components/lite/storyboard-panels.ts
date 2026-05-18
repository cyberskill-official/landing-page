export type StoryboardPanelId =
  | 'scene-0'
  | 'scene-1'
  | 'scene-2'
  | 'scene-3'
  | 'scene-4'
  | 'scene-5'
  | 'scene-6';

export type StoryboardPanelData = {
  id: StoryboardPanelId;
  sceneLabel: string;
  svgPath: `/storyboard/${string}.svg`;
  title: string;
  narration: string;
  alt: string;
  ctaPrimary: {
    label: string;
    href: string;
  };
};

const discoveryCall = {
  label: 'Book a Discovery Call',
  href: 'mailto:info@cyberskill.world?subject=Discovery%20Call',
} as const;

export const STORYBOARD_PANELS = [
  {
    id: 'scene-0',
    sceneLabel: 'Scene 0',
    svgPath: '/storyboard/scene-0-hero.svg',
    title: 'What if your will became real?',
    narration: "Whisper an idea. I'll show you the rest.",
    alt: 'Lumi beside a bright idea spark and the CyberSkill opening headline.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-1',
    sceneLabel: 'Scene 1',
    svgPath: '/storyboard/scene-1-origin.svg',
    title: 'Saigon, 2020.',
    narration: "Stephen had one rule: build what you'd be proud to sign.",
    alt: 'A Saigon workbench with a signed craft note and a quiet gold light.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-2',
    sceneLabel: 'Scene 2',
    svgPath: '/storyboard/scene-2-transformation.svg',
    title: 'From sketch to system.',
    narration: 'Most software dies in the gap between sketch and ship. We close it.',
    alt: 'A loose sketch becoming a working product interface.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-3',
    sceneLabel: 'Scene 3',
    svgPath: '/storyboard/scene-3-capabilities.svg',
    title: 'How we turn will into real.',
    narration: 'React, Three.js, AI, design systems — four hands of the same craft.',
    alt: 'Four capability pillars orbiting one central craft mark.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-4',
    sceneLabel: 'Scene 4',
    svgPath: '/storyboard/scene-4-team.svg',
    title: 'Ten people. One craft.',
    narration: 'Ten of us. All senior. All Vietnamese. All remote.',
    alt: 'Ten senior team lights arranged around one shared craft table.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-5',
    sceneLabel: 'Scene 5',
    svgPath: '/storyboard/scene-5-vietnam-global.svg',
    title: 'From Sài Gòn to your time zone.',
    narration: 'From Sài Gòn to your time zone.',
    alt: 'A luminous route from Saigon to global client time zones.',
    ctaPrimary: discoveryCall,
  },
  {
    id: 'scene-6',
    sceneLabel: 'Scene 6',
    svgPath: '/storyboard/scene-6-cta-hub.svg',
    title: 'What do you want to make real?',
    narration: 'You bring the will. We bring the real.',
    alt: 'Decision paths for buyers, partners, and future teammates.',
    ctaPrimary: discoveryCall,
  },
] as const satisfies readonly StoryboardPanelData[];

export const STORYBOARD_PANEL_IDS = STORYBOARD_PANELS.map((panel) => panel.id);
