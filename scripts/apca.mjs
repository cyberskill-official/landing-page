// APCA-W3 (0.1.9) lightness-contrast (Lc) core, plus sRGB helpers and alpha
// compositing for the Liquid Glass state (TASK-DS-006). Pure functions, exported
// so both the CLI guard (check-apca.mjs) and the unit test use the same code.

const mainTRC = 2.4;
const Rco = 0.2126729, Gco = 0.7151522, Bco = 0.072175;
const normBG = 0.56, normTXT = 0.57, revTXT = 0.62, revBG = 0.65;
const blkThrs = 0.022, blkClmp = 1.414;
const scaleBoW = 1.14, scaleWoB = 1.14;
const loBoWoffset = 0.027, loWoBoffset = 0.027;
const deltaYmin = 0.0005, loClip = 0.1;

export function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Composite a translucent colour (rgba, a in 0..1) over an opaque background.
export function over([r, g, b], a, [br, bg, bb]) {
  return [a * r + (1 - a) * br, a * g + (1 - a) * bg, a * b + (1 - a) * bb];
}

export function rgbToY([r, g, b]) {
  const lin = (c) => Math.pow(c / 255, mainTRC);
  return Rco * lin(r) + Gco * lin(g) + Bco * lin(b);
}

// APCA contrast Lc for text luminance over background luminance.
export function apcaLc(Ytxt, Ybg) {
  if (Ybg <= blkThrs) Ybg += Math.pow(blkThrs - Ybg, blkClmp);
  if (Ytxt <= blkThrs) Ytxt += Math.pow(blkThrs - Ytxt, blkClmp);
  if (Math.abs(Ybg - Ytxt) < deltaYmin) return 0;
  let out;
  if (Ybg > Ytxt) {
    const sapc = (Math.pow(Ybg, normBG) - Math.pow(Ytxt, normTXT)) * scaleBoW;
    out = sapc < loClip ? 0 : sapc - loBoWoffset;
  } else {
    const sapc = (Math.pow(Ybg, revBG) - Math.pow(Ytxt, revTXT)) * scaleWoB;
    out = sapc > -loClip ? 0 : sapc + loWoBoffset;
  }
  return out * 100;
}

// Convenience: Lc magnitude for an opaque text hex on an effective background rgb.
export function lcHexOnRgb(textHex, bgRgb) {
  return Math.abs(apcaLc(rgbToY(hexToRgb(textHex)), rgbToY(bgRgb)));
}
