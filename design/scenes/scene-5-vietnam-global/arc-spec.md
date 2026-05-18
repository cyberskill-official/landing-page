# Scene 5 Arc Spec

## Curve Type

Use cubic Bezier paths for the comp and great-circle sampling for the production globe. Each arc starts at HCMC and bends upward before landing on its destination pin.

## Timing

- `t=0.0s`: HCMC pin pulses in flag red.
- `t=0.4s`: caption typing begins.
- `t=0.8s`: NYC arc starts.
- `t=1.2s`: London arc starts.
- `t=1.6s`: Berlin arc starts.
- `t=2.4s`: all endpoint pins glow in star yellow.

## Colour

Arc heads start at `--brand-gold-400` and finish at `--accent-star-yellow`. Endpoint pins inherit star yellow; the HCMC origin remains flag red.

## Endpoint Behaviour

Destination pins appear as the arc head reaches them, then settle into a slow 0.9 alpha pulse. HCMC keeps a stronger 1.0 alpha pulse because it is the origin.
