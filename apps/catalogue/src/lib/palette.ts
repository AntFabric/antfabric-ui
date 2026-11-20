/**
 * Colour maths for the chart palette's checks (`pnpm check tokens`): OKLCH lightness and chroma, OKLab distance, contrast, and how a
 * colour reads to someone with protanopia or deuteranopia. Small on purpose: sRGB hex in, numbers out.
 */

export type RGB = [number, number, number];
export type Lab = [number, number, number];

/** `#rrggbb` (or `#rgb`) as 0..1 sRGB. */
export function parseHex(hex: string): RGB {
  const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)?.[1];
  if (!h) throw new Error(`palette: "${hex}" is not #rgb or #rrggbb`);
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as RGB;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const linear = (rgb: RGB): RGB => rgb.map(toLinear) as RGB;

/** OKLab (Ottosson, 2020) from linear RGB. */
export function oklab([r, g, b]: RGB): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/** Lightness (0..1) and chroma of a colour, the L and C of its OKLCH. */
export function lightnessChroma(hex: string): { l: number; c: number } {
  const [l, a, b] = oklab(linear(parseHex(hex)));
  return { l, c: Math.hypot(a, b) };
}

/** The distance between two OKLab colours, times 100: about 1 is the least a person can tell apart. */
export const distance = (p: Lab, q: Lab): number => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * 100;

// Machado, Oliveira and Fernandes (2009), severity 1.0 (the whole cone missing), applied to linear RGB.
const PROTAN = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998],
];
const DEUTAN = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
];
const through = (m: number[][], [r, g, b]: RGB): RGB => m.map((row) => Math.min(1, Math.max(0, row[0]! * r + row[1]! * g + row[2]! * b))) as RGB;

/** How far apart two colours stay: as most people see them, and the smaller of the protan and deutan distances. */
export function separation(a: string, b: string): { normal: number; colourBlind: number } {
  const [p, q] = [linear(parseHex(a)), linear(parseHex(b))];
  return {
    normal: distance(oklab(p), oklab(q)),
    colourBlind: Math.min(distance(oklab(through(PROTAN, p)), oklab(through(PROTAN, q))), distance(oklab(through(DEUTAN, p)), oklab(through(DEUTAN, q)))),
  };
}

/** WCAG 2 contrast ratio of two opaque colours. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = linear(parseHex(hex));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
