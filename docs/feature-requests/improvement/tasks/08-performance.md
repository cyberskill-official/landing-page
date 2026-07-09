# Epic 8 - performance and accessibility polish

Goal: keep the craft edge while the business surfaces grow. The budgets in lighthouserc.json (script 320 KB error, total 1.2 MB error, CLS 0.1 error, LCP 2.5 s warn) are the guardrails for every task in this backlog; nothing in other epics may break them.

---

### PERF-01 Aurora image responsive sizes
Wave 2 | owner: agent | effort: S | depends: none

Why: the aurora background is requested at width 3840 on the contact section; phones should pull a small variant.

Do: give the next/image usage a correct sizes attribute (and appropriate quality) so mobile devices request a width near their viewport; verify via the generated srcset and a mobile-width fetch of the _next/image URL; confirm the image budget (400 KB) holds.

Done when: mobile requests a variant at or below ~828px width, visual output unchanged, gates green.

---

### PERF-02 Preload the kinetic display font
Wave 2 | owner: agent | effort: S | depends: none

Why: the hero headline is the LCP element; a late display font risks CLS and a flash on slow connections.

Do: ensure the display font used by kinetic headings is preloaded (next/font already handles this if used; if the font is loaded another way, add the preload link) and that font-display behavior avoids layout shift; confirm the font budget (120 KB) holds.

Done when: no font-swap layout shift on a throttled load, budgets hold, gates green.

---

### PERF-03 Ensure APCA + axe checks run in CI
Wave 2 | owner: agent | effort: S | depends: none

Why: the scripts exist (check:apca, check:a11y:routes) but only help if they gate merges.

Do: confirm the GitHub Actions workflow runs both on PRs (alongside build and Lighthouse); add them if missing; make failures blocking; record current pass state in the ledger.

Done when: a PR with a deliberate contrast violation fails CI (verified once locally), workflow updated, gates green.

---

### PERF-04 VI diacritics rendering audit in kinetic type
Wave 2 | owner: agent | effort: S | depends: none

Why: clipped accents on Vietnamese capitals (Ậ, Ề, Ộ) are a classic overflow/line-height failure in animated type.

Do: render every VI kinetic heading at 360, 768, and 1280 widths; check for clipped diacritics or overflow (line-height, overflow, transform-origin issues); fix CSS where needed; add the worst-case strings to a visual checklist in the ledger entry.

Done when: no clipping at the three widths for all VI headings, gates green.

---

### PERF-05 Content-Security-Policy, report-only rollout
Wave 3 | owner: agent | effort: M | depends: stable third-party set (after MEAS-02)

Why: the header set (nosniff, frame deny, referrer, permissions) lacks CSP; report-only is the safe path on a site with inline styles from animation libraries.

Do:
1. Add Content-Security-Policy-Report-Only in next.config.ts covering script-src, style-src, img-src, connect-src, frame-ancestors, with the domains actually in use (self, Vercel, Sentry, Clarity if enabled, Resend is server-side only).
2. Collect violations for two weeks (report-to or Sentry CSP capture), tighten, then decide with Stephen whether to enforce.

Done when: report-only header live, violation reporting works, tightening list recorded; enforcement is a separate decision.
