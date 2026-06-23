---
id: FR-DS-006
title: "APCA contrast tooling for rendered translucent surfaces"
module: DS
priority: SHOULD
status: shipped
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-23
depends_on: [FR-DS-001, FR-DS-004]
source_pages:
  - "research doc §A (APCA contrast), §D (accessibility)"
new_files:
  - scripts/apca.mjs
  - scripts/check-apca.mjs
---

## §1 Requirement (BCP-14 normative)

Contrast MUST be measured at the surface a reader actually sees, including the
translucent glass state, not against an idealized solid background.

1. The tooling MUST compute APCA lightness contrast (Lc) for text against its
   effective rendered background, accounting for the composited Liquid Glass
   material rather than the token color alone.
2. The tooling MUST flag any body text below Lc 75 and any interactive label
   below Lc 90, and SHOULD run as a script the operator can invoke locally.
3. Results MUST identify the failing token or component so a fix is actionable.

## §2 Acceptance

- The script reports Lc per checked text-on-surface pair and exits non-zero when
  a threshold is missed.
- A deliberately low-contrast sample is caught at the glass state.

## §3 Evidence

Shipped. `scripts/apca.mjs` implements the APCA-W3 (0.1.9) Lc core (sRGB->Y,
soft black clamp, both polarities) plus alpha compositing for the glass state;
`tests/apca.test.ts` validates it against published reference values (black on
white ~106, white on black ~-108, #888 on white ~63). `scripts/check-apca.mjs`
(`npm run check:apca`) computes Lc for the key text-on-surface pairs - including
text on the standard glass tint composited over the page (§1.1) - and flags body
< Lc 75 and interactive labels < Lc 90, naming each pair (§1.2, §1.3), exiting
non-zero on a miss (§2).

The run caught two real misses at the rendered state. Fixed: dark-theme muted
text was Lc 63.2 on the dark bg; lightened `--cs-color-fg-muted` to `#dcd2c3`
(now Lc 79.3). Flagged for an operator design call: the primary button
(accent-ink `#3a2a05` on ochre `#f4ba17`) is Lc 66.0, under the strict
interactive 90. It meets WCAG 2.2 AA and sits in APCA's acceptable band for
large/bold labels, but not Lc 90; raising it needs a brand-colour decision, so
the tool keeps reporting it. The guard runs locally (not a blocking CI gate)
precisely because that last pair is a design choice, not a defect.
