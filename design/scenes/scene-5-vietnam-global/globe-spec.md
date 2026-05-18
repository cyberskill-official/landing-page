# Scene 5 Globe Spec

## Mesh

- Shape: stylized icosahedral sphere.
- Triangle budget: about 6,000 triangles for the production GLB.
- Shading: flat faces with warm brown base and gold facet lines.
- Texture: no photo Earth map, no NASA imagery, no realistic cloud layer.

## Map Anchors

- Vietnam pin: HCMC at `10.776N, 106.701E`.
- Destination pins: NYC, London, Berlin.
- HCMC pin uses `--accent-flag-red`.
- Destination pins use `--accent-star-yellow`.

## Motion

- Spin speed: `0.08 rad/s`, clockwise from the camera view.
- Camera distance: globe radius fits 60-68% of the canvas height at desktop and tablet, 55-60% at mobile.
- Reduced motion: no spin; keep pins and arcs visible as a static trust map.

## Handoff

The production scene should keep the faceted globe readable before the arc draw begins. The nón lá moment is the subject; the globe is the stage.
