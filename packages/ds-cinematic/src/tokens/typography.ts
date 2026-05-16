export const family = {
  display: 'Inter Display, system-ui, sans-serif',
  caption: 'JetBrains Mono, ui-monospace, monospace',
  body: 'system-ui, -apple-system, sans-serif',
} as const;

export const size = {
  'display.hero':        'clamp(40px, 6vw, 96px)',
  'display.scene-title': 'clamp(32px, 4.5vw, 72px)',
  'display.scene-sub':   'clamp(20px, 2.2vw, 32px)',
  'body.base':           '16px',
  'body.sm':             '14px',
  'body.lg':             '18px',
  'caption.lumi':        'clamp(16px, 1.5vw, 22px)',
  'caption.meta':        '13px',
  'cta.label':           'clamp(16px, 1.2vw, 18px)',
} as const;

export const weight = {
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const letterSpacing = {
  display: '-0.03em',
  body: '0',
  caption: '0.01em',
} as const;
