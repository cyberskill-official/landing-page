// In-repo SVG icon set (TASK-DS-010): no external icon-library dependency. Each
// icon is data - a viewBox plus a list of primitive elements - rendered through
// the one <Icon> component. Line icons use currentColor stroke so they follow
// the surrounding text token.

export type IconElement = {
  tag: "path" | "circle" | "line";
  attrs: Record<string, string | number>;
};

export type IconDef = { viewBox: string; els: IconElement[] };

export type IconName =
  | "close"
  | "sun"
  | "moon"
  | "arrow-right"
  | "check"
  | "sparkle"
  | "chat"
  | "sound-on"
  | "sound-off";

export const icons: Record<IconName, IconDef> = {
  close: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M6 6l12 12M18 6L6 18" } },
    ],
  },
  sun: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "circle", attrs: { cx: 12, cy: 12, r: 4 } },
      { tag: "path", attrs: { d: "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" } },
    ],
  },
  moon: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5z" } },
    ],
  },
  "arrow-right": {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M5 12h14M13 6l6 6-6 6" } },
    ],
  },
  check: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M4 12.5l5 5 11-11" } },
    ],
  },
  sparkle: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" } },
    ],
  },
  chat: {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M4 5h16v11H8l-4 4z" } },
    ],
  },
  "sound-on": {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M5 9v6h3l4 4V5L8 9z" } },
      { tag: "path", attrs: { d: "M15 9.5a4 4 0 0 1 0 5M17.6 7a8 8 0 0 1 0 10" } },
    ],
  },
  "sound-off": {
    viewBox: "0 0 24 24",
    els: [
      { tag: "path", attrs: { d: "M5 9v6h3l4 4V5L8 9z" } },
      { tag: "path", attrs: { d: "M16 9.5l4.5 5M20.5 9.5l-4.5 5" } },
    ],
  },
};
