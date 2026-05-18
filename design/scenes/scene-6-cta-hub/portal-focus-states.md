# Scene 6 Portal Focus States

## Portal Set

Exactly three portals render in this order: `buy`, `partner`, `join`. A fourth portal requires a master-plan amendment.

## States

| State | Visual | Lumi | DOM / a11y note |
|---|---|---|---|
| default | Three portals visible, no modal | Head faces Buy by default | Tab order: buy, partner, join |
| hover | Hovered portal raises glow by one step | Head turns toward hovered portal | Ignore hover on coarse pointers |
| focused-keyboard | 2px gold-400 outline with 2px offset | Head turns toward focused portal | `:focus-visible`; target remains at least 44x44 |
| focused-deep-link | Partner portal pre-focused for `?track=partner` | Head faces Partner | Use `aria-current="page"` on the matching portal |
| clicked-opens-modal | Modal shell opens over hub | Head holds selected portal | Suspense fallback: `Loading...` in `aria-live="polite"`, then selected form replaces it |

## Rotation Limits

Lumi turns by head rotation only. Buy is `-24deg`, Partner is `0deg`, Join is `+24deg`. Do not exceed `+/-30deg`.

## Track Copy

- Buy: Book a Discovery Call. For builders who need senior partners.
- Partner: Partner With Us. For agencies seeking white-label & co-delivery.
- Join: Join the Team. For senior craftspeople, remote-first.
