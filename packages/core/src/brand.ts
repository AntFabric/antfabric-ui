/**
 * Tenant branding: what a white-label tenant supplies, and the tokens that follow from it.
 *
 * The product's phone does this at runtime. A tenant carries one `primary` and one `accent`, and may
 * hand-pick four tints per scheme (`primarySoft`, `primarySoftDeep`, `primarySoftFg`, `barTint`); the
 * phone merges them over the base palette and derives whatever the tenant did not pick from `primary`.
 * `BrandTokens` is that input. A product gives it to `defineTheme({ name, extends, brand })`
 * (`theme.ts`), which expands it per scheme with `brandValues` into the theme's sets; both kits then draw the theme
 * (`AntFabricRoot theme`, `ThemeProvider theme`).
 *
 * Only the brand family is overridable. Neutrals, status colours and identity colours (`color.background.identity.agent`
 * is Fabric, never a tenant) stay put. `color.text.onBrand` is picked by contrast (`onBrandFor`): white while white reaches 4.5:1 on the
 * primary, otherwise ink. AntFabric's own coral takes ink (white on #fe4632 is 3.42:1).
 */

import { tokens } from "./tokens";
import type { Scheme } from "./types";

/** The weights the phone loads a file for, as the mobile profile's `font.file*` tokens name them. */
export type FontFileWeight = "regular" | "medium" | "semibold" | "bold" | "extrabold";

/**
 * A family the app loads itself (the kit ships Figtree and Satoshi, nothing else). A string is the family alone.
 */
export interface BrandFont {
  /** The family's name, as the app's `@font-face` declares it. On the web and the desktop it goes in front of the kit's stack, so the stack still stands in while it loads. */
  family: string;
  /** The phone: the name each weight's file is registered under with expo-font. A weight left out is `<family>-Regular`, `-Medium`, `-SemiBold`, `-Bold` or `-ExtraBold`. */
  files?: Partial<Record<FontFileWeight, string>>;
}

/**
 * What a tenant can change. Every key is optional in use (`Partial<BrandTokens>`): give a `primary` and
 * everything that follows from it is derived; give a hand-picked tint and it wins over the derived one.
 */
export interface BrandTokens {
  /** The brand colour, `#rgb` or `#rrggbb`: `color.background.brand.default` (tenants.ts:16, `primary`). Hover, pressed, the soft tints, the link and the unread tint derive from it. */
  primary: string;
  /** The second colour, `#rgb` or `#rrggbb`: `color.background.accent.default` (tenants.ts:17); `color.background.accent.soft` derives from it. */
  accent: string;
  /** `color.background.brand.soft` per theme, opaque or not, where the brand has a designed one (tenants.ts:24-27, `primarySoft`). */
  soft: Record<Scheme, string>;
  /** `color.background.brand.softHover` per theme: one step deeper than `soft` (tenants.ts:28-33, `primarySoftDeep`). */
  softHover: Record<Scheme, string>;
  /** `color.text.onBrandSoft` per theme: ink on a `soft` surface (tenants.ts:34-39, `primarySoftFg`). */
  onSoft: Record<Scheme, string>;
  /** `color.background.brand.tint` per theme: the tab bar's chosen capsule (tenants.ts:40-45, `barTint`). */
  tint: Record<Scheme, string>;
  /** The body (`sans`) and headline (`display`) families: `font.family.sans` and `font.family.display`, and on the phone the `font.file*` names. Colours and fonts are all a brand changes. */
  fonts: { sans?: string | BrandFont; display?: string | BrandFont };
}

/** Token paths a brand sets, with the value each takes: the brand family, its documented dependents and the two font families. */
export type BrandValues = Partial<Record<(typeof BRAND_PATHS)[number] | (typeof BRAND_FONT_PATHS)[number], string>>;

/** The only tokens a brand ever changes, so a check can say that nothing else moved. */
export const BRAND_PATHS = [
  "color.background.brand.default",
  "color.background.brand.hover",
  "color.background.brand.pressed",
  "color.background.brand.soft",
  "color.background.brand.softHover",
  "color.background.brand.tint",
  "color.background.accent.default",
  "color.background.accent.soft",
  "color.text.onBrandSoft",
  "color.text.onBrand",
  "color.text.brand",
  "color.text.link",
  "color.border.brand",
  "color.background.unread",
] as const;

/** The font tokens a brand's `fonts` changes. The `file*` ones are the phone's own (the mobile profile's) and are set only where it is drawn. */
export const BRAND_FONT_PATHS = [
  "font.family.sans",
  "font.family.display",
  "font.file.sans.regular",
  "font.file.sans.medium",
  "font.file.sans.semibold",
  "font.file.sans.bold",
  "font.file.sans.extrabold",
  "font.file.display.regular",
  "font.file.display.medium",
  "font.file.display.semibold",
  "font.file.display.bold",
  "font.file.display.extrabold",
] as const;

/** Per weight: the token's suffix (`font.file.sans.semibold`) and the file's default suffix (`Inter-SemiBold`, as Figtree's files are named). */
const FILE_SUFFIX: Record<FontFileWeight, [token: string, file: string]> = {
  regular: ["Regular", "Regular"],
  medium: ["Medium", "Medium"],
  semibold: ["Semibold", "SemiBold"],
  bold: ["Bold", "Bold"],
  extrabold: ["Extrabold", "ExtraBold"],
};

/**
 * Where a brand's font values are going. A CSS `stack` keeps the kit's stack behind the family (the web, the desktop and React Native
 * Web); without one a phone takes the family's name alone, as `resolveTokens` does for the kit's own. `files` sets the phone's file names.
 */
export interface BrandTarget {
  stack?: boolean;
  files?: boolean;
}

function fontValues(face: "sans" | "display", input: string | BrandFont, { stack = true, files = false }: BrandTarget, out: BrandValues) {
  const font = typeof input === "string" ? { family: input } : input;
  const family = font.family.trim();
  if (!family || /["';{}]/.test(family)) throw new Error(`brand.fonts.${face} must be a font family name, got "${font.family}"`);
  out[`font.family.${face}`] = stack ? `"${family}", ${tokens.shared.font.family[face]}` : family;
  if (!files) return;
  for (const [weight, [token, file]] of Object.entries(FILE_SUFFIX) as [FontFileWeight, [string, string]][])
    out[`font.file.${face}.${token.toLowerCase()}` as (typeof BRAND_FONT_PATHS)[number]] = font.files?.[weight] ?? `${family}-${file}`;
}

/** A colour as 0..255 sRGB channels. */
export type RGB = [number, number, number];

function parse(hex: string, what: string): RGB {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`brand.${what} must be #rgb or #rrggbb, got "${hex}"`);
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join("") : m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

/** `rgb()`/`rgba()`/`hsl()`/`hsla()` with numbers only, comma, space or slash between them (written so that nothing backtracks). */
const COLOUR_FN = /^(?:rgba?|hsla?)\(\s*[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:%|deg|turn|rad|grad)?(?:(?:\s*[,/]\s*|\s+)[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:%|deg|turn|rad|grad)?)*\s*\)$/i;

/** A hand-picked colour as given, when it is one both kits draw: hex, `rgb()`/`rgba()` or `hsl()`/`hsla()` with numbers only (React Native has no `oklch()`). */
function colour(v: unknown, what: string): string {
  const ok = typeof v === "string" && (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v.trim()) || COLOUR_FN.test(v.trim()));
  if (!ok) throw new Error(`brand.${what} must be a colour (#hex, rgb() or hsl()), got "${String(v)}"`);
  return v as string;
}

const hex = ([r, g, b]: RGB) => `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;

/** The product's `withAlpha` (tokens.ts:1060), written as `rgba()` like every other translucent token here: `.12`, not `0.12`. */
function alpha(c: RGB, a: number): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${String(a).replace(/^0\./, ".")})`;
}

/** `amount` of the way from `c` to `to`. */
const mix = (c: RGB, to: RGB, amount: number): RGB => c.map((v, i) => v + (to[i]! - v) * amount) as RGB;
const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];
/** `color.text.strong` in the light theme: the ink a light brand fill takes instead of white. */
const INK: RGB = parse(tokens.themes.light.color.text.strong, "ink");

const luminance = (c: RGB) => {
  const [r, g, b] = c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2's contrast ratio of two opaque colours (relative luminance), 1 to 21. */
export const contrast = (a: RGB, b: RGB): number => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** An opaque colour as written in a token: `#rgb`, `#rrggbb`, `rgb()`/`rgba()` or `hsl()`/`hsla()` with numbers (its alpha is ignored); `undefined` for anything else. */
export function rgbOf(value: string): RGB | undefined {
  const v = value.trim();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return parse(v, "colour");
  const n = "([-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+))";
  const m = new RegExp(`^(rgba?|hsla?)\\(\\s*${n}(deg|turn|rad|grad)?\\s*[,\\s]\\s*${n}%?\\s*[,\\s]\\s*${n}%?`, "i").exec(v);
  if (!m) return undefined;
  const [a, unit, b, c] = [Number(m[2]), m[3]?.toLowerCase(), Number(m[4]), Number(m[5])];
  if (m[1]!.toLowerCase().startsWith("rgb")) return [a, b, c];
  // hsl: the hue in degrees (or turns, radians, gradians), saturation and lightness in percent.
  const h = ((unit === "turn" ? a * 360 : unit === "rad" ? (a * 180) / Math.PI : unit === "grad" ? a * 0.9 : a) % 360 + 360) % 360;
  const [sat, light] = [Math.min(1, Math.max(0, b / 100)), Math.min(1, Math.max(0, c / 100))];
  const k = (x: number) => (x + h / 30) % 12;
  const f = (x: number) => light - sat * Math.min(light, 1 - light) * Math.max(-1, Math.min(k(x) - 3, 9 - k(x), 1));
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255)) as RGB;
}

/**
 * Text on a brand fill, by contrast (WCAG 1.4.3, 4.5:1): white while white reaches 4.5:1 on it, otherwise whichever of white and ink reads
 * better. A dark tenant keeps white; AntFabric's coral (white 3.42:1, ink 5.20:1) and a yellow or pale-teal tenant take ink. As hex.
 */
export function onBrandFor(fill: RGB): string {
  return hex(contrast(WHITE, fill) >= 4.5 || contrast(WHITE, fill) >= contrast(INK, fill) ? WHITE : INK);
}

/**
 * The tokens a brand sets for one theme.
 *
 * Derived from `primary`, the product's rules where it has one (ThemeProvider.tsx):
 *  - `color.background.brand.soft`        12% (light) / 22% (dark) of `primary`          :187
 *  - `color.background.brand.softHover`   20% / 32%                                      :188
 *  - `color.text.onBrandSoft`    `primary` itself                               :189
 *  - `color.background.unread`    2.5% / 5%                                      :190
 *  - `color.background.brand.tint`        the hand-picked `soft`, else the same tint as `color.background.brand.soft`  :191
 *  - `color.background.accent.soft`       14% / 22% of `accent`                          :193
 *  - `color.text.onBrand`        white or ink by contrast on `primary` (`onBrandFor`); the product's is always white
 * The product has no hover, pressed, link or brand-border token (its phone presses with opacity), so
 * those are this repository's: `color.background.brand.hover` and `color.background.brand.pressed` move away from the text drawn on them (10% and
 * 25% toward black under white text, 15% and 35% toward white under ink), `color.text.brand` is `primary` 25% toward black on light and
 * 60% toward white on dark (the default coral's are #c02616 and #ffb8ab), `color.text.link` is that colour on light and 35% toward white on dark, and
 * `color.border.brand` is 60% toward white on light and 40% toward black on dark.
 *
 * A hand-picked `soft`, `softHover`, `onSoft` or `tint` replaces its derived value.
 *
 * `fonts` sets `font.family.sans` and `font.family.display` (a CSS stack unless `target.stack` is false) and, with `target.files`, the phone's file
 * names. `target` is the default, the web's; `defineTheme` asks for the stack and the files, as both kits read the theme's sets.
 */
export function brandValues(brand: Partial<BrandTokens>, theme: Scheme, target: BrandTarget = {}): BrandValues {
  const dark = theme === "dark";
  const out: BrandValues = {};
  if (brand.primary !== undefined) {
    const p = parse(brand.primary, "primary");
    const active = dark ? mix(p, WHITE, 0.6) : mix(p, BLACK, 0.25);
    out["color.background.brand.default"] = hex(p);
    // The hover and pressed fills move away from the text drawn on them (`color.text.onBrand`), so that text keeps its contrast: darker
    // under white text, lighter under ink. The brand as text (`color.text.brand`) is the colour the pressed fill used to be.
    const white = onBrandFor(p) === "#ffffff";
    out["color.background.brand.hover"] = hex(white ? mix(p, BLACK, 0.1) : mix(p, WHITE, 0.15));
    out["color.background.brand.pressed"] = hex(white ? mix(p, BLACK, 0.25) : mix(p, WHITE, 0.35));
    out["color.text.brand"] = hex(active);
    out["color.background.brand.soft"] = alpha(p, dark ? 0.22 : 0.12);
    out["color.background.brand.softHover"] = alpha(p, dark ? 0.32 : 0.2);
    out["color.text.onBrandSoft"] = hex(p);
    out["color.text.onBrand"] = onBrandFor(p);
    out["color.text.link"] = hex(dark ? mix(p, WHITE, 0.35) : active);
    out["color.border.brand"] = hex(dark ? mix(p, BLACK, 0.4) : mix(p, WHITE, 0.6));
    out["color.background.unread"] = alpha(p, dark ? 0.05 : 0.025);
    out["color.background.brand.tint"] = out["color.background.brand.soft"];
  }
  if (brand.accent !== undefined) {
    const a = parse(brand.accent, "accent");
    out["color.background.accent.default"] = hex(a);
    out["color.background.accent.soft"] = alpha(a, dark ? 0.22 : 0.14);
  }
  if (brand.soft) {
    out["color.background.brand.soft"] = colour(brand.soft[theme], `soft.${theme}`);
    out["color.background.brand.tint"] = brand.soft[theme];
  }
  if (brand.softHover) out["color.background.brand.softHover"] = colour(brand.softHover[theme], `softHover.${theme}`);
  if (brand.onSoft) out["color.text.onBrandSoft"] = colour(brand.onSoft[theme], `onSoft.${theme}`);
  if (brand.tint) out["color.background.brand.tint"] = colour(brand.tint[theme], `tint.${theme}`);
  if (brand.fonts?.sans !== undefined) fontValues("sans", brand.fonts.sans, target, out);
  if (brand.fonts?.display !== undefined) fontValues("display", brand.fonts.display, target, out);
  return out;
}
