/**
 * WCAG 2.x relative-luminance contrast helpers + Porter-Duff source-over
 * compositing for solid CSS background-color layers (alpha preserved).
 * Shared by the Phase 2 button probe and its unit tests.
 */

/** Porter-Duff source-over. fg and bg are [r,g,b,a] with rgb in 0..255, a in 0..1. */
export function overRgba(fg, bg) {
  const fa = fg[3];
  const ba = bg[3];
  const a = fa + ba * (1 - fa);
  if (a <= 0) return [0, 0, 0, 0];
  return [
    Math.round((fg[0] * fa + bg[0] * ba * (1 - fa)) / a),
    Math.round((fg[1] * fa + bg[1] * ba * (1 - fa)) / a),
    Math.round((fg[2] * fa + bg[2] * ba * (1 - fa)) / a),
    a,
  ];
}

/** Composite rgba onto an opaque fallback; returns [r,g,b]. */
export function flattenOpaque(rgba, fallbackRgb = [255, 255, 255]) {
  if (rgba[3] >= 1) return rgba.slice(0, 3);
  return overRgba(rgba, [...fallbackRgb, 1]).slice(0, 3);
}

/**
 * Composite solid background-color layers from nearest (index 0) to farthest.
 * Each layer is [r,g,b,a]. Returns opaque [r,g,b] against fallbackRgb.
 */
export function compositeSolidLayers(layersNearToFar, fallbackRgb = [255, 255, 255]) {
  let acc = [0, 0, 0, 0];
  for (const layer of layersNearToFar) {
    if (layer[3] > 0) acc = overRgba(acc, layer);
    if (acc[3] >= 1) break;
  }
  return flattenOpaque(acc, fallbackRgb);
}

export function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  return +(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2));
}
