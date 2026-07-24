/**
 * Above-the-fold first-paint CSS inlined into the root layout so Vercel's
 * prerender snapshot includes it (post-build Critters never reaches deploy).
 *
 * Scope: dark default theme (html data-theme=dark), header, hero LCP text,
 * primary CTAs, container. Full design system loads via cs-package.css
 * (package token SoT, no fonts.css) + globals.css storytelling layer.
 * Values here mirror package semantics + Lumi dark APCA muted override;
 * regenerate if package colour/spacing contracts change.
 */
export const CRITICAL_CSS = `
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
html,body{overflow-x:clip}
:root{
  --cs-color-brand-umber:#45210e;--cs-color-brand-ochre:#f4ba17;
  --cs-color-text-primary:#45210e;--cs-color-text-muted:#6e5a4c;
  --cs-color-surface-page:#fffdf8;--cs-color-surface-panel:#fff;
  --cs-color-border-default:#e7d9c6;--cs-color-semantic-info:#1d4ed8;
  --cs-color-fg:var(--cs-color-text-primary);--cs-color-fg-muted:var(--cs-color-text-muted);
  --cs-color-bg:var(--cs-color-surface-page);--cs-color-surface:var(--cs-color-surface-panel);
  --cs-color-line:var(--cs-color-border-default);
  --cs-color-accent:var(--cs-color-brand-ochre);--cs-color-accent-ink:#3a2a05;
  --cs-color-brand:var(--cs-color-brand-umber);--cs-color-on-brand:#fdf4e1;
  --cs-color-focus:var(--cs-color-semantic-info);--cs-glass-border:rgba(69,33,14,.12);
  --cs-box-shadow-3:0 12px 40px rgba(28,19,13,.12);
  --cs-font-sans:"Be Vietnam Pro",system-ui,-apple-system,"Segoe UI","Helvetica Neue",arial,sans-serif;
  --cs-font-display:"Space Grotesk",system-ui,"Segoe UI",sans-serif;
  --cs-text-xs:.8rem;--cs-text-sm:.9rem;--cs-text-base:1rem;--cs-text-lg:1.2rem;
  --cs-text-xl:clamp(1.35rem,1.1rem + 1vw,1.6rem);
  --cs-text-4xl:clamp(2.9rem,1.9rem + 5.4vw,5.6rem);
  --cs-space-2:.5rem;--cs-space-3:.75rem;--cs-space-4:1rem;--cs-space-6:1.5rem;
  --cs-space-12:3rem;--cs-space-16:4rem;--cs-space-24:6rem;
  --cs-radius-full:999px;--cs-radius-pill:var(--cs-radius-full);
  --cs-container:72rem;--cs-ease:cubic-bezier(.22,1,.36,1)
}
[data-theme=dark]{
  --cs-color-text-primary:#f5ead9;--cs-color-text-muted:#c9b7a3;
  --cs-color-surface-page:#1a1108;--cs-color-surface-panel:#221710;
  --cs-color-border-default:#4a3a2c;
  --cs-color-fg:var(--cs-color-text-primary);--cs-color-fg-muted:#dcd2c3;
  --cs-color-bg:var(--cs-color-surface-page);--cs-color-surface:var(--cs-color-surface-panel);
  --cs-color-line:var(--cs-color-border-default);--cs-color-on-brand:#fdf4e1;
  --cs-glass-border:rgba(244,186,23,.16);--cs-color-focus:var(--cs-color-brand-ochre)
}
body{
  margin:0;background:var(--cs-color-bg);color:var(--cs-color-fg);
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  font-size:var(--cs-text-base);line-height:1.65;font-weight:400;
  -webkit-font-smoothing:antialiased;
  background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(244,186,23,.07),transparent 55%)
}
h1,h2,h3{font-family:var(--cs-font-display);line-height:1.08;letter-spacing:-.02em;font-weight:700;margin:0 0 var(--cs-space-4)}
h1{font-size:var(--cs-text-4xl);letter-spacing:-.03em;line-height:1.02}
p{margin:0 0 var(--cs-space-4)}
a{color:inherit;text-underline-offset:.18em}
:focus-visible{outline:3px solid var(--cs-color-focus);outline-offset:2px;border-radius:4px}
.cs-container{width:100%;max-width:var(--cs-container);margin-inline:auto;padding-inline:var(--cs-space-6)}
.cs-skip-link{position:absolute;left:-999px;top:0;z-index:100;padding:.5rem 1rem;background:var(--cs-color-accent);color:var(--cs-color-accent-ink);font-weight:700}
.cs-skip-link:focus{left:var(--cs-space-4);top:var(--cs-space-4)}
.cs-header{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--cs-glass-border);background:color-mix(in srgb,#120c08 88%,transparent);backdrop-filter:blur(14px)}
.cs-header-inner{display:flex;align-items:center;gap:var(--cs-space-4);padding-block:var(--cs-space-3);min-height:76px}
.cs-wordmark{display:flex;flex-direction:row;align-items:center;gap:var(--cs-space-2);text-decoration:none;line-height:1.1}
.cs-wordmark-mark{width:34px;height:34px;flex:none;display:block}
.cs-wordmark-text{display:flex;flex-direction:column}
.cs-wordmark-name{font-family:var(--cs-font-display);font-weight:700;font-size:var(--cs-text-lg);color:var(--cs-color-accent)}
.cs-wordmark-slogan{font-size:var(--cs-text-xs);color:var(--cs-color-fg-muted);max-width:14rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:480px){.cs-wordmark-slogan{display:none}}
.cs-nav{display:none;gap:var(--cs-space-6);margin-inline:auto}
.cs-nav a{text-decoration:none;font-weight:600}
.cs-header-actions{display:flex;align-items:center;gap:var(--cs-space-3);margin-left:auto;min-height:38px}
.cs-header-cta{display:none}
@media (min-width:900px){.cs-nav{display:flex}.cs-header-cta{display:inline-flex}.cs-header-actions{margin-left:0}}
.cs-lang{display:inline-flex;gap:2px;border:1px solid var(--cs-color-line);border-radius:var(--cs-radius-pill);padding:2px}
.cs-lang-link{padding:2px var(--cs-space-3);border-radius:var(--cs-radius-pill);text-decoration:none;font-size:var(--cs-text-sm);font-weight:600;color:var(--cs-color-fg-muted)}
.cs-lang-link[data-active=true]{background:var(--cs-color-brand);color:var(--cs-color-on-brand)}
.cs-hero{background:transparent;min-height:min(86vh,760px);display:flex;align-items:center;padding-block:var(--cs-space-24);position:relative;overflow:hidden}
.cs-hero-inner{max-width:46rem;position:relative;z-index:1}
.cs-eyebrow{font-size:var(--cs-text-sm);font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--cs-color-accent);margin:0}
.cs-hero-title,.cs-hero-lead,.cs-hero-subline,.cs-hero .cs-eyebrow{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",arial,sans-serif
}
.cs-hero-title{font-size:var(--cs-text-4xl);margin-top:var(--cs-space-3);font-weight:700;line-height:1.05;letter-spacing:-.03em;color:#f4ece0;max-width:20ch}
.cs-hero-lead{font-size:var(--cs-text-lg);color:var(--cs-color-fg-muted);max-width:36rem}
.cs-hero-subline{font-size:var(--cs-text-lg);color:var(--cs-color-fg-muted);max-width:36rem;margin:0 0 var(--cs-space-3);line-height:1.45}
.cs-hero-actions{display:flex;flex-wrap:wrap;gap:var(--cs-space-3);margin-top:var(--cs-space-6)}
.cs-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  min-height:44px;padding:.65rem 1.15rem;border-radius:var(--cs-radius-pill);
  font:inherit;font-weight:700;font-size:var(--cs-text-sm);text-decoration:none;border:1px solid transparent;cursor:pointer
}
.cs-btn-primary{background-color:#f4ba17;color:#3a2a05;border-color:#f4ba17}
.cs-btn-secondary{background:transparent;color:var(--cs-color-fg);border-color:var(--cs-color-line)}
.cs-btn-brand{background:var(--cs-color-brand);color:var(--cs-color-on-brand)}
.cs-canvas-layer,.cs-header,main,.cs-footer{position:relative;z-index:1}
.cs-section{padding-block:var(--cs-space-24)}
@media (max-width:760px){.cs-hero{padding-block:var(--cs-space-16);min-height:min(80vh,640px)}.cs-section{padding-block:var(--cs-space-16)}}
`.replace(/\n/g, "").trim();

export const CRITICAL_STYLE_ID = "cs-critical";
